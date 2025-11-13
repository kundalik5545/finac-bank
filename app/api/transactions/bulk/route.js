/**
 * Bulk Transaction Upload API
 * 
 * This endpoint handles bulk upload of transactions from Excel files.
 * It parses the Excel file, validates each row, and creates transactions in the database.
 * 
 * POST /api/transactions/bulk
 * 
 * Request: multipart/form-data
 * - file: Excel file (.xlsx, .xls)
 * - bankAccountId (optional): Default bank account ID if not provided in Excel
 * 
 * Response: { success: number, failed: number, errors: array }
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { transactionSchema } from "@/lib/formSchema";
import { parseExcelToJSON, parseDate, parseNumber, parseBoolean } from "@/lib/excelParser";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const bankAccountIdParam = formData.get("bankAccountId");

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" },
        { status: 400 }
      );
    }

    // Validate file size
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Parse Excel file to JSON
    let parsedData;
    try {
      parsedData = parseExcelToJSON(fileBuffer);
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to parse Excel file: ${error.message}` },
        { status: 400 }
      );
    }

    // Validate that we have data
    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty or has no data rows" },
        { status: 400 }
      );
    }

    // Required columns for transactions
    const requiredColumns = ["amount", "currency", "type", "date"];
    const existingColumns = Object.keys(parsedData[0] || {});
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required columns",
          missingColumns,
          existingColumns,
        },
        { status: 400 }
      );
    }

    // Get user's bank accounts for validation
    const userBankAccounts = await prisma.bankAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const bankAccountIds = userBankAccounts.map((acc) => acc.id);

    // Process each row and validate
    const transactions = [];
    const errors = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const rowNumber = i + 2; // +2 because row 1 is header, Excel rows start at 1

      try {
        // Determine bankAccountId: from Excel, from param, or error
        let bankAccountId = row.bankAccountId || bankAccountIdParam || null;

        // If still no bankAccountId, try to find by name
        if (!bankAccountId && row["Bank Account Name"]) {
          const account = userBankAccounts.find(
            (acc) => acc.name.toLowerCase() === row["Bank Account Name"].toLowerCase()
          );
          if (account) {
            bankAccountId = account.id;
          }
        }

        // Validate bankAccountId exists and belongs to user
        if (!bankAccountId) {
          throw new Error("Bank account is required. Please provide bankAccountId in Excel or select one in the form.");
        }

        if (!bankAccountIds.includes(bankAccountId)) {
          throw new Error(`Bank account with ID ${bankAccountId} not found or access denied`);
        }

        // Parse and convert data types
        const amount = parseNumber(row.amount);
        if (amount === null || amount <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const date = parseDate(row.date);
        if (!date) {
          throw new Error(`Invalid date format: ${row.date}. Please use YYYY-MM-DD format`);
        }

        // Build transaction data object
        const transactionData = {
          amount: amount,
          currency: (row.currency || "INR").toUpperCase(),
          type: (row.type || "").toUpperCase(),
          status: (row.status || "PENDING").toUpperCase(),
          date: date,
          description: row.description || null,
          comments: row.comments || null,
          isActive: parseBoolean(row.isActive) ?? true,
          bankAccountId: bankAccountId,
          categoryId: row.categoryId || null,
          subCategoryId: row.subCategoryId || null,
          paymentMethod: row.paymentMethod ? (row.paymentMethod || "").toUpperCase() : null,
          budgetId: row.budgetId || null,
        };

        // Validate using Zod schema
        const validatedData = transactionSchema.parse(transactionData);

        // Add userId for database insertion
        validatedData.userId = session.user.id;

        transactions.push(validatedData);
      } catch (error) {
        failedCount++;
        errors.push({
          row: rowNumber,
          error: error.message || "Validation failed",
          data: row,
        });
      }
    }

    // If no valid transactions, return early
    if (transactions.length === 0) {
      return NextResponse.json(
        {
          success: 0,
          failed: failedCount,
          errors,
          message: "No valid transactions found. Please check your Excel file.",
        },
        { status: 400 }
      );
    }

    // Insert transactions in database using transaction for atomicity
    let insertedCount = 0;
    const dbErrors = [];

    try {
      // Use Prisma transaction to ensure all-or-nothing if needed
      // For bulk insert, we'll do individual creates to track errors per row
      for (const transaction of transactions) {
        try {
          await prisma.transaction.create({
            data: transaction,
          });
          insertedCount++;
        } catch (dbError) {
          // Find the original row number for this transaction
          const transactionIndex = transactions.indexOf(transaction);
          const originalRow = parsedData[transactionIndex];
          const rowNumber = transactionIndex + 2;

          dbErrors.push({
            row: rowNumber,
            error: dbError.message || "Database error",
            data: originalRow,
          });
          failedCount++;
        }
      }
    } catch (error) {
      console.error("Error inserting transactions:", error);
      return NextResponse.json(
        {
          error: "Failed to insert transactions",
          details: error.message,
          success: insertedCount,
          failed: failedCount,
          errors: [...errors, ...dbErrors],
        },
        { status: 500 }
      );
    }

    // Return summary
    return NextResponse.json(
      {
        success: insertedCount,
        failed: failedCount,
        errors: errors.length > 0 || dbErrors.length > 0 ? [...errors, ...dbErrors] : undefined,
        message:
          failedCount > 0
            ? `${insertedCount} transactions created successfully, ${failedCount} failed.`
            : `${insertedCount} transactions created successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk transaction upload:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process bulk upload",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


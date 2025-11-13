/**
 * Bulk Transaction Upload API
 *
 * This endpoint handles bulk upload of transactions from Excel files.
 * It parses the Excel file, validates each row, and creates transactions in the database.
 * OPTIMIZED: Uses batch operations for better performance.
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
// Batch size for processing (process in chunks to avoid memory issues)
const BATCH_SIZE = 100;
// Increased timeout for large files
const TRANSACTION_TIMEOUT = 120000; // 2 minutes

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

    // Get user's bank accounts for validation (single query)
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

    const bankAccountIds = new Set(userBankAccounts.map((acc) => acc.id));
    const bankAccountMap = new Map(
      userBankAccounts.map((acc) => [acc.name.toLowerCase(), acc.id])
    );

    // Process each row and validate
    const transactions = [];
    const errors = [];
    let failedCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const rowNumber = i + 2; // +2 because row 1 is header, Excel rows start at 1

      try {
        // Determine bankAccountId: from Excel, from param, or error
        let bankAccountId = row.bankAccountId || bankAccountIdParam || null;

        // If still no bankAccountId, try to find by name
        if (!bankAccountId && row["Bank Account Name"]) {
          const accountId = bankAccountMap.get(row["Bank Account Name"].toLowerCase());
          if (accountId) {
            bankAccountId = accountId;
          }
        }

        // Validate bankAccountId exists and belongs to user
        if (!bankAccountId) {
          throw new Error(
            "Bank account is required. Please provide bankAccountId in Excel or select one in the form."
          );
        }

        if (!bankAccountIds.has(bankAccountId)) {
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

        transactions.push({
          ...validatedData,
          _rowNumber: rowNumber,
        });
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

    // Insert transactions in batches using createMany for better performance
    let insertedCount = 0;
    const dbErrors = [];

    // Use Prisma transaction for data consistency
    await prisma.$transaction(
      async (tx) => {
        // Process in batches to avoid memory issues and improve performance
        for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
          const batch = transactions.slice(i, i + BATCH_SIZE);

          try {
            // Prepare data for createMany (remove _rowNumber)
            const dataToInsert = batch.map((txn) => {
              const { _rowNumber, ...data } = txn;
              return data;
            });

            // Use createMany for batch insert (much faster than individual creates)
            const result = await tx.transaction.createMany({
              data: dataToInsert,
              skipDuplicates: false, // We want to know about duplicates
            });

            insertedCount += result.count;
          } catch (batchError) {
            // If batch insert fails, try individual inserts for this batch
            console.error(`Batch insert failed, trying individual inserts:`, batchError);
            for (const transaction of batch) {
              try {
                const { _rowNumber, ...data } = transaction;
                await tx.transaction.create({
                  data,
                });
                insertedCount++;
              } catch (dbError) {
                dbErrors.push({
                  row: transaction._rowNumber,
                  error: dbError.message || "Database error",
                  data: parsedData[transaction._rowNumber - 2], // Get original row data
                });
                failedCount++;
              }
            }
          }
        }
      },
      {
        timeout: TRANSACTION_TIMEOUT, // Increased timeout for large files
      }
    );

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

    // Handle Prisma transaction timeout
    if (error.code === "P2025" || error.message?.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Operation timed out. Please try with a smaller file or contact support.",
        },
        { status: 408 }
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

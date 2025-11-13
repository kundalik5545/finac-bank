/**
 * Bulk Category Upload API
 *
 * This endpoint handles bulk upload of categories from Excel files.
 * IMPORTANT: This is a first-time only operation. If categories already exist,
 * users must use individual add/edit/delete functionality.
 *
 * POST /api/categories/bulk
 *
 * Request: multipart/form-data
 * - file: Excel file (.xlsx, .xls) with category data
 *
 * Excel Format:
 * - Column A: name (required) - Category name
 * - Column B: type (required) - INCOME/EXPENSE/TRANSFER/INVESTMENT
 * - Column C: color (optional) - Hex color format: #RRGGBB
 * - Column D: icon (optional) - Icon name (Lucide icon)
 *
 * Response: { categoriesCreated: number, categories: array, errors: array }
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { bulkCategoryRowSchema } from "@/lib/formSchema";
import { parseExcelToJSON } from "@/lib/excelParser";

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

    // FIRST-TIME CHECK: Verify user has no existing categories
    const existingCategoriesCount = await prisma.category.count({
      where: {
        userId: session.user.id,
      },
    });

    if (existingCategoriesCount > 0) {
      return NextResponse.json(
        {
          error: "Categories already exist",
          message:
            "Bulk upload is only available for first-time setup. You already have categories. Please use the 'Add Category' button to add new categories, or delete all categories first to start over.",
        },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

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

    // Required columns for categories
    const requiredColumns = ["name", "type"];
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

    // Validate and parse each row
    const validatedRows = [];
    const errors = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const rowNumber = i + 2; // +2 because row 1 is header, Excel rows start at 1

      try {
        // Normalize type to uppercase
        const normalizedRow = {
          ...row,
          type: row.type ? String(row.type).toUpperCase().trim() : row.type,
        };

        // Validate row using Zod schema
        const validatedRow = bulkCategoryRowSchema.parse(normalizedRow);
        validatedRows.push({
          ...validatedRow,
          _rowNumber: rowNumber,
        });
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error.errors?.[0]?.message || error.message || "Validation failed",
          data: row,
        });
      }
    }

    // If no valid rows, return early
    if (validatedRows.length === 0) {
      return NextResponse.json(
        {
          categoriesCreated: 0,
          categories: [],
          errors,
          message: "No valid category data found. Please check your Excel file.",
        },
        { status: 400 }
      );
    }

    // Process categories - skip duplicates by name+type combination
    let categoriesCreated = 0;
    const createdCategories = [];
    const dbErrors = [];

    // Use Prisma transaction for data consistency
    await prisma.$transaction(
      async (tx) => {
        for (const rowData of validatedRows) {
          try {
            // Check if category already exists (by name, type, and userId)
            const existingCategory = await tx.category.findFirst({
              where: {
                name: rowData.name,
                type: rowData.type,
                userId: session.user.id,
              },
            });

            // Skip if already exists
            if (existingCategory) {
              continue;
            }

            // Create category
            const category = await tx.category.create({
              data: {
                name: rowData.name,
                type: rowData.type,
                icon: rowData.icon || null,
                color: rowData.color || null,
                userId: session.user.id,
              },
            });

            categoriesCreated++;
            createdCategories.push({
              id: category.id,
              name: category.name,
              type: category.type,
              icon: category.icon,
              color: category.color,
            });
          } catch (catError) {
            dbErrors.push({
              row: rowData._rowNumber,
              error: `Failed to create category "${rowData.name}": ${catError.message}`,
              data: rowData,
            });
          }
        }
      },
      {
        timeout: 30000, // 30 second timeout for large files
      }
    );

    // Return summary
    return NextResponse.json(
      {
        categoriesCreated,
        categories: createdCategories,
        errors: errors.length > 0 || dbErrors.length > 0 ? [...errors, ...dbErrors] : undefined,
        message:
          errors.length > 0 || dbErrors.length > 0
            ? `${categoriesCreated} categories created. Some rows had errors.`
            : `${categoriesCreated} categories created successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk category upload:", error);

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

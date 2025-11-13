/**
 * Bulk Subcategory Upload API
 *
 * This endpoint handles bulk upload of subcategories from Excel files.
 * Users must have categories first, then upload subcategories with category IDs.
 *
 * POST /api/subcategories/bulk
 *
 * Request: multipart/form-data
 * - file: Excel file (.xlsx, .xls) with subcategory data
 *
 * Excel Format:
 * - Column A: categoryId (required) - UUID of existing category
 * - Column B: name (required) - Subcategory name
 * - Column C: color (optional) - Hex color format: #RRGGBB
 * - Column D: icon (optional) - Icon name (Lucide icon)
 *
 * Response: { subCategoriesCreated: number, errors: array }
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { bulkSubCategoryRowSchema } from "@/lib/formSchema";
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

    // Required columns for subcategories
    const requiredColumns = ["categoryId", "name"];
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

    // Get user's categories for validation
    const userCategories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    const categoryIds = userCategories.map((cat) => cat.id);
    const categoryMap = new Map(userCategories.map((cat) => [cat.id, cat]));

    // Validate and parse each row
    const validatedRows = [];
    const errors = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const rowNumber = i + 2; // +2 because row 1 is header, Excel rows start at 1

      try {
        // Validate row using Zod schema
        const validatedRow = bulkSubCategoryRowSchema.parse(row);

        // Validate categoryId exists and belongs to user
        if (!categoryIds.includes(validatedRow.categoryId)) {
          throw new Error(
            `Category ID "${validatedRow.categoryId}" not found. Please use a valid category ID from your categories.`
          );
        }

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
          subCategoriesCreated: 0,
          errors,
          message: "No valid subcategory data found. Please check your Excel file.",
        },
        { status: 400 }
      );
    }

    // Process subcategories - skip duplicates by name+categoryId combination
    let subCategoriesCreated = 0;
    const dbErrors = [];

    // Use Prisma transaction for data consistency
    await prisma.$transaction(
      async (tx) => {
        for (const rowData of validatedRows) {
          try {
            // Check if subcategory already exists
            const existingSubCategory = await tx.subCategory.findFirst({
              where: {
                name: rowData.name,
                categoryId: rowData.categoryId,
                userId: session.user.id,
              },
            });

            // Skip if already exists
            if (existingSubCategory) {
              continue;
            }

            // Create subcategory
            await tx.subCategory.create({
              data: {
                name: rowData.name,
                icon: rowData.icon || null,
                color: rowData.color || null,
                categoryId: rowData.categoryId,
                userId: session.user.id,
              },
            });

            subCategoriesCreated++;
          } catch (subError) {
            dbErrors.push({
              row: rowData._rowNumber,
              error: `Failed to create subcategory "${rowData.name}": ${subError.message}`,
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
        subCategoriesCreated,
        errors: errors.length > 0 || dbErrors.length > 0 ? [...errors, ...dbErrors] : undefined,
        message:
          errors.length > 0 || dbErrors.length > 0
            ? `${subCategoriesCreated} subcategories created. Some rows had errors.`
            : `${subCategoriesCreated} subcategories created successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk subcategory upload:", error);

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


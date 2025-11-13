/**
 * Bulk Subcategory Upload API
 *
 * This endpoint handles bulk upload of subcategories from Excel files.
 * Users must have categories first, then upload subcategories with category IDs.
 * OPTIMIZED: Uses batch operations for better performance.
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

    // Get user's categories for validation (single query)
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

    const categoryIds = new Set(userCategories.map((cat) => cat.id));
    const categoryMap = new Map(userCategories.map((cat) => [cat.id, cat]));

    // Get existing subcategories in batch (single query for all)
    const existingSubCategories = await prisma.subCategory.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        name: true,
        categoryId: true,
      },
    });

    // Create a Set for fast duplicate checking: "name|categoryId"
    const existingSubCategoryKeys = new Set(
      existingSubCategories.map((sub) => `${sub.name}|${sub.categoryId}`)
    );

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
        if (!categoryIds.has(validatedRow.categoryId)) {
          throw new Error(
            `Category ID "${validatedRow.categoryId}" not found. Please use a valid category ID from your categories.`
          );
        }

        // Check for duplicates using Set lookup (O(1) instead of database query)
        const duplicateKey = `${validatedRow.name}|${validatedRow.categoryId}`;
        if (existingSubCategoryKeys.has(duplicateKey)) {
          continue; // Skip duplicates silently
        }

        validatedRows.push({
          name: validatedRow.name,
          icon: validatedRow.icon || null,
          color: validatedRow.color || null,
          categoryId: validatedRow.categoryId,
          userId: session.user.id,
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
          errors: errors.length > 0 ? errors : undefined,
          message: "No valid subcategory data found. Please check your Excel file.",
        },
        { status: 400 }
      );
    }

    // Process subcategories in batches using createMany for better performance
    let subCategoriesCreated = 0;
    const dbErrors = [];

    // Use Prisma transaction for data consistency
    await prisma.$transaction(
      async (tx) => {
        // Process in batches to avoid memory issues and improve performance
        for (let i = 0; i < validatedRows.length; i += BATCH_SIZE) {
          const batch = validatedRows.slice(i, i + BATCH_SIZE);

          try {
            // Prepare data for createMany (remove _rowNumber)
            const dataToInsert = batch.map((row) => ({
              name: row.name,
              icon: row.icon,
              color: row.color,
              categoryId: row.categoryId,
              userId: row.userId,
            }));

            // Use createMany for batch insert (much faster than individual creates)
            const result = await tx.subCategory.createMany({
              data: dataToInsert,
              skipDuplicates: true, // Skip duplicates at database level as well
            });

            subCategoriesCreated += result.count;

            // Update the existing keys set to track what we've inserted
            batch.forEach((row) => {
              existingSubCategoryKeys.add(`${row.name}|${row.categoryId}`);
            });
          } catch (batchError) {
            // If batch insert fails, try individual inserts for this batch
            console.error(`Batch insert failed, trying individual inserts:`, batchError);
            for (const rowData of batch) {
              try {
                await tx.subCategory.create({
                  data: {
                    name: rowData.name,
                    icon: rowData.icon,
                    color: rowData.color,
                    categoryId: rowData.categoryId,
                    userId: rowData.userId,
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

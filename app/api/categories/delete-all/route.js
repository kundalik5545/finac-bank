/**
 * Delete All Categories API
 *
 * This endpoint deletes all categories and subcategories for the authenticated user.
 * This is a destructive operation and should be used with caution.
 *
 * DELETE /api/categories/delete-all
 *
 * Response: { categoriesDeleted: number, subCategoriesDeleted: number }
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";

export async function DELETE(request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all subcategories for the user
      // This must be done before deleting categories due to foreign key constraints
      const deletedSubCategories = await tx.subCategory.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // Then, delete all categories for the user
      const deletedCategories = await tx.category.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return {
        categoriesDeleted: deletedCategories.count,
        subCategoriesDeleted: deletedSubCategories.count,
      };
    });

    return NextResponse.json(
      {
        ...result,
        message: `Successfully deleted ${result.categoriesDeleted} categories and ${result.subCategoriesDeleted} subcategories.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting all categories:", error);

    return NextResponse.json(
      {
        error: "Failed to delete categories",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


/**
 * Delete All Subcategories API
 *
 * This endpoint deletes all subcategories for the authenticated user.
 * This is a destructive operation and should be used with caution.
 *
 * DELETE /api/subcategories/delete-all
 *
 * Response: { subCategoriesDeleted: number }
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

    // Delete all subcategories for the user
    const deletedSubCategories = await prisma.subCategory.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        subCategoriesDeleted: deletedSubCategories.count,
        message: `Successfully deleted ${deletedSubCategories.count} subcategories.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting all subcategories:", error);

    return NextResponse.json(
      {
        error: "Failed to delete subcategories",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


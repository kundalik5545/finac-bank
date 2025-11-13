import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateSubCategorySchema } from "@/lib/formSchema";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, subId } = await params;
    const body = await request.json();
    const validatedData = updateSubCategorySchema.parse(body);

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if subcategory exists and belongs to user and category
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: {
        id: subId,
        categoryId: id,
        userId: session.user.id,
      },
    });

    if (!existingSubCategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: subId },
      data: validatedData,
    });

    return NextResponse.json({ subCategory });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, subId } = await params;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if subcategory exists and belongs to user and category
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: {
        id: subId,
        categoryId: id,
        userId: session.user.id,
      },
      include: {
        transactions: true,
      },
    });

    if (!existingSubCategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    // Check if subcategory has transactions
    if (existingSubCategory.transactions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete subcategory with existing transactions" },
        { status: 400 }
      );
    }

    await prisma.subCategory.delete({
      where: { id: subId },
    });

    return NextResponse.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateInvestmentSchema } from "@/lib/formSchema";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
        subCategory: true,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ investment });
  } catch (error) {
    console.error("Error fetching investment:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Convert date string to Date object if needed
    if (body.purchaseDate && typeof body.purchaseDate === "string") {
      body.purchaseDate = new Date(body.purchaseDate);
    }

    const validatedData = updateInvestmentSchema.parse(body);

    // Check if investment exists and belongs to user
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingInvestment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    // Prepare update data, only including provided fields
    const updateData = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.symbol !== undefined) updateData.symbol = validatedData.symbol || null;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.purchasePrice !== undefined) updateData.purchasePrice = validatedData.purchasePrice;
    if (validatedData.currentPrice !== undefined) updateData.currentPrice = validatedData.currentPrice || null;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = validatedData.purchaseDate;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId || null;
    if (validatedData.subCategoryId !== undefined) updateData.subCategoryId = validatedData.subCategoryId || null;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes || null;

    const investment = await prisma.investment.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subCategory: true,
      },
    });

    return NextResponse.json({ investment });
  } catch (error) {
    console.error("Error updating investment:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update investment" },
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

    const { id } = await params;

    // Check if investment exists and belongs to user
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingInvestment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    await prisma.investment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Investment deleted successfully" });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    );
  }
}


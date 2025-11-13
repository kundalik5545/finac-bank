import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateTransactionSchema } from "@/lib/formSchema";

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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
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
    const validatedData = updateTransactionSchema.parse(body);

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // If bankAccountId is being updated, verify it belongs to user
    if (validatedData.bankAccountId) {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: {
          id: validatedData.bankAccountId,
          userId: session.user.id,
        },
      });

      if (!bankAccount) {
        return NextResponse.json(
          { error: "Bank account not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Convert date string to Date if needed
    const updateData = { ...validatedData };
    if (updateData.date) {
      updateData.date =
        updateData.date instanceof Date
          ? updateData.date
          : new Date(updateData.date);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update transaction" },
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

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Soft delete: set isActive to false
    await prisma.transaction.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}


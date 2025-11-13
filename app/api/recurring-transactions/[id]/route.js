import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateRecurringTransactionSchema } from "@/lib/formSchema";

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

    const recurringTransaction = await prisma.recurringTransaction.findFirst({
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
            color: true,
            icon: true,
          },
        },
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!recurringTransaction) {
      return NextResponse.json(
        { error: "Recurring transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ recurringTransaction });
  } catch (error) {
    console.error("Error fetching recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring transaction" },
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
    const validatedData = updateRecurringTransactionSchema.parse(body);

    // Check if recurring transaction exists and belongs to user
    const existingRecurringTransaction =
      await prisma.recurringTransaction.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      });

    if (!existingRecurringTransaction) {
      return NextResponse.json(
        { error: "Recurring transaction not found" },
        { status: 404 }
      );
    }

    // Verify bank account if being updated
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

    // Convert date strings to Date if needed
    const updateData = { ...validatedData };
    if (validatedData.startDate) {
      updateData.startDate =
        validatedData.startDate instanceof Date
          ? validatedData.startDate
          : new Date(validatedData.startDate);
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate
        ? validatedData.endDate instanceof Date
          ? validatedData.endDate
          : new Date(validatedData.endDate)
        : null;
    }

    const recurringTransaction = await prisma.recurringTransaction.update({
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
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ recurringTransaction });
  } catch (error) {
    console.error("Error updating recurring transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update recurring transaction" },
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

    // Check if recurring transaction exists and belongs to user
    const existingRecurringTransaction =
      await prisma.recurringTransaction.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
        include: {
          transactions: true,
        },
      });

    if (!existingRecurringTransaction) {
      return NextResponse.json(
        { error: "Recurring transaction not found" },
        { status: 404 }
      );
    }

    // Delete the recurring transaction
    // Note: Associated transactions will remain but recurringTransactionId will be null
    await prisma.recurringTransaction.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Recurring transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring transaction" },
      { status: 500 }
    );
  }
}


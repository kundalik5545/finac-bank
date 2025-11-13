import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { updateTransactionSchema } from "@/lib/formSchema";
import { updateBankBalance } from "@/lib/balance-utils";
import { revalidatePath } from "next/cache";
import { updateBudgetTotals } from "@/action/budget";
import { checkAndSendBudgetAlerts } from "@/lib/budget-alerts";

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

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get old transaction data for balance calculation
      const oldTransaction = await tx.transaction.findUnique({
        where: { id },
        select: {
          amount: true,
          type: true,
          status: true,
          bankAccountId: true,
          isActive: true,
        },
      });

      // Update transaction
      const transaction = await tx.transaction.update({
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

      // Update bank balance based on changes
      await updateBankBalance(transaction, oldTransaction, "update", tx);

      return transaction;
    });

    // Recalculate budgets if transaction affects budgets
    if (
      (result.type === "EXPENSE" && result.status === "COMPLETED") ||
      (oldTransaction?.type === "EXPENSE" && oldTransaction?.status === "COMPLETED")
    ) {
      try {
        const transactionDate = new Date(result.date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();

        // Get affected budgets (old and new category/month/year)
        const budgetsToUpdate = [];

        // New budget
        if (result.categoryId) {
          const newBudget = await prisma.budget.findFirst({
            where: {
              userId: session.user.id,
              categoryId: result.categoryId,
              month,
              year,
              isActive: true,
            },
          });
          if (newBudget) budgetsToUpdate.push(newBudget);
        }

        // Old budget (if category or date changed)
        if (oldTransaction) {
          const oldDate = new Date(existingTransaction.date);
          const oldMonth = oldDate.getMonth() + 1;
          const oldYear = oldDate.getFullYear();

          if (
            (oldTransaction.categoryId !== result.categoryId ||
              oldMonth !== month ||
              oldYear !== year) &&
            oldTransaction.categoryId
          ) {
            const oldBudget = await prisma.budget.findFirst({
              where: {
                userId: session.user.id,
                categoryId: oldTransaction.categoryId,
                month: oldMonth,
                year: oldYear,
                isActive: true,
              },
            });
            if (oldBudget && !budgetsToUpdate.find((b) => b.id === oldBudget.id)) {
              budgetsToUpdate.push(oldBudget);
            }
          }
        }

        // Update all affected budgets
        for (const budget of budgetsToUpdate) {
          await updateBudgetTotals(budget.id);
          // Check and send alerts (async)
          checkAndSendBudgetAlerts(budget.id, session.user.id).catch((err) => {
            console.error("Error sending budget alerts:", err);
          });
        }
      } catch (error) {
        console.error("Error updating budgets for transaction:", error);
        // Don't fail the transaction update if budget check fails
      }
    }

    // Revalidate paths to refresh pages
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/bank-account");
    revalidatePath("/budgets");
    revalidatePath(`/transactions/${id}`);

    return NextResponse.json({ transaction: result });
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

    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Soft delete: set isActive to false
      const deletedTransaction = await tx.transaction.update({
        where: { id },
        data: { isActive: false },
        select: {
          amount: true,
          type: true,
          status: true,
          bankAccountId: true,
          isActive: true,
        },
      });

      // Revert balance change if transaction was COMPLETED
      await updateBankBalance(null, existingTransaction, "delete", tx);
    });

    // Recalculate budgets if deleted transaction affected budgets
    if (
      existingTransaction.type === "EXPENSE" &&
      existingTransaction.status === "COMPLETED" &&
      existingTransaction.categoryId
    ) {
      try {
        const transactionDate = new Date(existingTransaction.date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();

        const budget = await prisma.budget.findFirst({
          where: {
            userId: session.user.id,
            categoryId: existingTransaction.categoryId,
            month,
            year,
            isActive: true,
          },
        });

        if (budget) {
          await updateBudgetTotals(budget.id);
          // Check and send alerts (async)
          checkAndSendBudgetAlerts(budget.id, session.user.id).catch((err) => {
            console.error("Error sending budget alerts:", err);
          });
        }
      } catch (error) {
        console.error("Error updating budgets for deleted transaction:", error);
        // Don't fail the transaction deletion if budget check fails
      }
    }

    // Revalidate paths to refresh pages
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/bank-account");
    revalidatePath("/budgets");
    revalidatePath(`/transactions/${id}`);

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}


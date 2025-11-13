import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { transactionSchema, transactionFilterSchema } from "@/lib/formSchema";
import { updateBankBalance } from "@/lib/balance-utils";
import { revalidatePath } from "next/cache";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filterParams = Object.fromEntries(searchParams.entries());
    const filters = transactionFilterSchema.parse(filterParams);

    // Build where clause
    const where = {
      userId: session.user.id,
    };

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    }

    // Bank account filter
    if (filters.bankAccountId) {
      where.bankAccountId = filters.bankAccountId;
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Sub-category filter
    if (filters.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    }

    // Type filter
    if (filters.type) {
      where.type = filters.type;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Payment method filter
    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    // Amount range filter
    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      where.amount = {};
      if (filters.amountMin !== undefined) {
        where.amount.gte = filters.amountMin;
      }
      if (filters.amountMax !== undefined) {
        where.amount.lte = filters.amountMax;
      }
    }

    // Search filter (description and comments)
    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
        { comments: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Active filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;
    const take = filters.limit;

    // Build orderBy
    const orderBy = {};
    if (filters.sortBy === "amount") {
      orderBy.amount = filters.sortOrder;
    } else {
      orderBy.date = filters.sortOrder;
    }

    // Fetch transactions with relations
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy,
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
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate statistics
    const allTransactions = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        type: true,
        status: true,
        paymentMethod: true,
        categoryId: true,
        date: true,
      },
    });

    const stats = {
      totalCount: total,
      totalIncome: allTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalExpense: allTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalTransfer: allTransactions
        .filter((t) => t.type === "TRANSFER")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalInvestment: allTransactions
        .filter((t) => t.type === "INVESTMENT")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      netAmount: 0,
      byType: {
        INCOME: {
          count: allTransactions.filter((t) => t.type === "INCOME").length,
          sum: allTransactions
            .filter((t) => t.type === "INCOME")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        EXPENSE: {
          count: allTransactions.filter((t) => t.type === "EXPENSE").length,
          sum: allTransactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        TRANSFER: {
          count: allTransactions.filter((t) => t.type === "TRANSFER").length,
          sum: allTransactions
            .filter((t) => t.type === "TRANSFER")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        INVESTMENT: {
          count: allTransactions.filter((t) => t.type === "INVESTMENT").length,
          sum: allTransactions
            .filter((t) => t.type === "INVESTMENT")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
      },
      byStatus: {
        PENDING: allTransactions.filter((t) => t.status === "PENDING").length,
        COMPLETED: allTransactions.filter((t) => t.status === "COMPLETED").length,
        FAILED: allTransactions.filter((t) => t.status === "FAILED").length,
      },
      byPaymentMethod: {
        UPI: {
          count: allTransactions.filter((t) => t.paymentMethod === "UPI").length,
          sum: allTransactions
            .filter((t) => t.paymentMethod === "UPI")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        CASH: {
          count: allTransactions.filter((t) => t.paymentMethod === "CASH").length,
          sum: allTransactions
            .filter((t) => t.paymentMethod === "CASH")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        CARD: {
          count: allTransactions.filter((t) => t.paymentMethod === "CARD").length,
          sum: allTransactions
            .filter((t) => t.paymentMethod === "CARD")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        ONLINE: {
          count: allTransactions.filter((t) => t.paymentMethod === "ONLINE").length,
          sum: allTransactions
            .filter((t) => t.paymentMethod === "ONLINE")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
        OTHER: {
          count: allTransactions.filter((t) => t.paymentMethod === "OTHER").length,
          sum: allTransactions
            .filter((t) => t.paymentMethod === "OTHER")
            .reduce((sum, t) => sum + Number(t.amount), 0),
        },
      },
      dateRange: {
        min: allTransactions.length > 0
          ? new Date(Math.min(...allTransactions.map((t) => new Date(t.date).getTime())))
          : null,
        max: allTransactions.length > 0
          ? new Date(Math.max(...allTransactions.map((t) => new Date(t.date).getTime())))
          : null,
      },
    };

    // Calculate net amount
    stats.netAmount = stats.totalIncome - stats.totalExpense;

    // Calculate byCategory (top 5)
    const categoryMap = new Map();
    allTransactions.forEach((t) => {
      if (t.categoryId) {
        const current = categoryMap.get(t.categoryId) || { count: 0, sum: 0 };
        categoryMap.set(t.categoryId, {
          count: current.count + 1,
          sum: current.sum + Number(t.amount),
        });
      }
    });

    const byCategory = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({ categoryId, ...data }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 5);

    stats.byCategory = byCategory;

    return NextResponse.json({
      transactions,
      total,
      page: filters.page,
      limit: filters.limit,
      stats,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    // Verify bank account belongs to user
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

    // Convert date string to Date if needed
    const transactionData = {
      ...validatedData,
      date: validatedData.date instanceof Date
        ? validatedData.date
        : new Date(validatedData.date),
      userId: session.user.id,
    };

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: transactionData,
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

      // Update bank balance if transaction is COMPLETED
      await updateBankBalance(transaction, null, "create", tx);

      return transaction;
    });

    // Check and update budgets if transaction is EXPENSE and COMPLETED
    if (result.type === "EXPENSE" && result.status === "COMPLETED" && result.categoryId) {
      try {
        const transactionDate = new Date(result.date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();

        // Find matching budget
        const budget = await prisma.budget.findFirst({
          where: {
            userId: session.user.id,
            categoryId: result.categoryId,
            month,
            year,
            isActive: true,
          },
        });

        if (budget) {
          // Update budget totals
          const { updateBudgetTotals } = await import("@/action/budget");
          await updateBudgetTotals(budget.id);

          // Check and send alerts (async, don't wait)
          const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alerts");
          checkAndSendBudgetAlerts(budget.id, session.user.id).catch((err) => {
            console.error("Error sending budget alerts:", err);
          });
        }
      } catch (error) {
        console.error("Error checking budget for transaction:", error);
        // Don't fail the transaction creation if budget check fails
      }
    }

    // Revalidate paths to refresh pages
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/bank-account");
    revalidatePath("/budgets");

    return NextResponse.json({ transaction: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}


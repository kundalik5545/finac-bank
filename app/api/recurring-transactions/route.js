import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import {
  addRecurringTransactionSchema,
  recurringTransactionFilterSchema,
} from "@/lib/formSchema";

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
    const filters = recurringTransactionFilterSchema.parse(filterParams);

    // Build where clause
    const where = {
      userId: session.user.id,
    };

    // Frequency filter
    if (filters.frequency) {
      where.frequency = filters.frequency;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Bank account filter
    if (filters.bankAccountId) {
      where.bankAccountId = filters.bankAccountId;
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Active filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.recurringTransaction.count({ where });

    // Build orderBy
    const orderBy = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.startDate = "desc";
    }

    // Fetch recurring transactions
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where,
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
          select: {
            id: true,
            date: true,
            status: true,
          },
          orderBy: {
            date: "desc",
          },
          take: 5, // Get last 5 transactions
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate stats
    const allRecurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    const totalValue = allRecurringTransactions.reduce(
      (sum, rt) => sum + Number(rt.amount),
      0
    );

    // Category-wise breakdown
    const categoryBreakdown = {};
    allRecurringTransactions.forEach((rt) => {
      const categoryName = rt.category?.name || "Uncategorized";
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          name: categoryName,
          value: 0,
          color: rt.category?.color || "#6b7280",
        };
      }
      categoryBreakdown[categoryName].value += Number(rt.amount);
    });

    // This month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        recurringTransactionId: { not: null },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const thisMonthCompleted = thisMonthTransactions.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const thisMonthRemaining = thisMonthTransactions.filter(
      (t) => t.status === "PENDING"
    ).length;

    const stats = {
      totalValue,
      categoryBreakdown: Object.values(categoryBreakdown),
      thisMonthCompleted,
      thisMonthRemaining,
      totalRecurringTransactions: allRecurringTransactions.length,
    };

    return NextResponse.json({
      recurringTransactions,
      total,
      page,
      limit,
      stats,
    });
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch recurring transactions" },
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
    const validatedData = addRecurringTransactionSchema.parse(body);

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

    // Convert date strings to Date if needed
    const recurringTransactionData = {
      ...validatedData,
      startDate:
        validatedData.startDate instanceof Date
          ? validatedData.startDate
          : new Date(validatedData.startDate),
      endDate: validatedData.endDate
        ? validatedData.endDate instanceof Date
          ? validatedData.endDate
          : new Date(validatedData.endDate)
        : null,
      userId: session.user.id,
    };

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: recurringTransactionData,
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

    return NextResponse.json(
      { recurringTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating recurring transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create recurring transaction" },
      { status: 500 }
    );
  }
}


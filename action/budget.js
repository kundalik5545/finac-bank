import prisma from "@/db/db.config";

/**
 * Create a new budget
 */
export async function createBudget(data) {
  try {
    const { userId, amount, month, year, categoryId, alertThreshold, description, isActive } = data;

    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!amount || amount <= 0) {
      throw new Error("Budget amount must be greater than 0");
    }
    if (!month || month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    if (!year || year < 2000 || year > 2100) {
      throw new Error("Year must be valid");
    }

    // Normalize categoryId - convert empty string to null
    const normalizedCategoryId = categoryId && categoryId !== "" && categoryId !== "none" ? categoryId : null;

    // Check for duplicate budget (same user, category, month, year)
    if (normalizedCategoryId) {
      const existing = await prisma.budget.findFirst({
        where: {
          userId,
          categoryId: normalizedCategoryId,
          month,
          year,
          isActive: true,
        },
      });

      if (existing) {
        throw new Error("Budget already exists for this category, month, and year");
      }
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
        categoryId: normalizedCategoryId,
        alertThreshold: alertThreshold ? Number(alertThreshold) : 80,
        description: description || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return budget;
  } catch (error) {
    console.error("Error creating budget:", error);
    console.error("Error details:", error.message);
    throw error;
  }
}

/**
 * Update an existing budget
 */
export async function updateBudget(budgetId, userId, data) {
  try {
    // Verify budget belongs to user
    const existing = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Budget not found or access denied");
    }

    // Check for duplicate if category/month/year is being changed
    if (data.categoryId !== undefined || data.month !== undefined || data.year !== undefined) {
      const categoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId;
      const month = data.month !== undefined ? data.month : existing.month;
      const year = data.year !== undefined ? data.year : existing.year;

      if (categoryId) {
        const duplicate = await prisma.budget.findFirst({
          where: {
            userId,
            categoryId,
            month,
            year,
            isActive: true,
            id: { not: budgetId },
          },
        });

        if (duplicate) {
          throw new Error("Budget already exists for this category, month, and year");
        }
      }
    }

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...data,
        categoryId: data.categoryId !== undefined ? (data.categoryId || null) : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return budget;
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(budgetId, userId) {
  try {
    // Verify budget belongs to user
    const existing = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Budget not found or access denied");
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error;
  }
}

/**
 * Get all budgets for a user
 */
export async function getBudgets(userId, filters = {}) {
  try {
    const { month, year, categoryId, isActive } = filters;

    const where = {
      userId,
      ...(month !== undefined && { month }),
      ...(year !== undefined && { year }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(isActive !== undefined && { isActive }),
    };

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    return budgets;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
}

/**
 * Get a single budget by ID with progress
 */
export async function getBudgetById(budgetId, userId) {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        transactions: {
          where: {
            status: "COMPLETED",
            isActive: true,
            type: "EXPENSE",
          },
        },
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Calculate progress
    const budgetAmount = Number(budget.amount);
    const spent = budget.transactions.reduce((sum, tx) => {
      const txDate = new Date(tx.date);
      const budgetMonth = budget.month || txDate.getMonth() + 1;
      const budgetYear = budget.year || txDate.getFullYear();

      if (txDate.getMonth() + 1 === budgetMonth && txDate.getFullYear() === budgetYear) {
        return sum + Number(tx.amount);
      }
      return sum;
    }, 0);

    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
    const remaining = budgetAmount - spent;

    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

/**
 * Check budget status and return alert type if needed
 */
export async function checkBudgetStatus(budgetId, userId) {
  try {
    const budget = await getBudgetById(budgetId, userId);
    const budgetAmount = Number(budget.amount);
    const spent = budget.spent || 0;
    const percentage = budget.percentage || 0;

    if (percentage >= 100) {
      return { status: "EXCEEDED", percentage, spent, remaining: budgetAmount - spent };
    } else if (percentage >= budget.alertThreshold) {
      return { status: "WARNING", percentage, spent, remaining: budgetAmount - spent };
    }

    return { status: "OK", percentage, spent, remaining: budgetAmount - spent };
  } catch (error) {
    console.error("Error checking budget status:", error);
    throw error;
  }
}

/**
 * Recalculate budget totals from transactions
 */
export async function updateBudgetTotals(budgetId) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        transactions: {
          where: {
            status: "COMPLETED",
            isActive: true,
            type: "EXPENSE",
          },
        },
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    const budgetMonth = budget.month;
    const budgetYear = budget.year;

    // Calculate totals for transactions within budget period
    let totalWithdrawals = 0;
    let totalDeposits = 0;

    budget.transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const txMonth = txDate.getMonth() + 1;
      const txYear = txDate.getFullYear();

      if (budgetMonth && budgetYear && txMonth === budgetMonth && txYear === budgetYear) {
        const amount = Number(tx.amount);
        if (tx.type === "EXPENSE") {
          totalWithdrawals += amount;
        } else if (tx.type === "INCOME") {
          totalDeposits += amount;
        }
      }
    });

    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalWithdrawals,
        totalDeposits,
      },
    });

    return { totalWithdrawals, totalDeposits };
  } catch (error) {
    console.error("Error updating budget totals:", error);
    throw error;
  }
}


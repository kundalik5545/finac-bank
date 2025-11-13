"use server";

import prisma from "@/db/db.config";

/**
 * Get monthly summary for dashboard summary cards
 */
export async function getMonthlySummary(userId) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get total expense for current month
    const totalExpense = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get total income for current month
    const totalIncome = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get biggest spending category
    const categoryExpenses = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: 1,
    });

    let biggestCategory = null;
    if (categoryExpenses.length > 0 && categoryExpenses[0].categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryExpenses[0].categoryId },
        select: { id: true, name: true, color: true },
      });
      if (category) {
        biggestCategory = {
          name: category.name,
          amount: Number(categoryExpenses[0]._sum.amount || 0),
          color: category.color,
        };
      }
    }

    // Get budget usage (if budgets exist)
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: now.getMonth() + 1, // 1-12
        year: now.getFullYear(),
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
          },
        },
      },
    });

    let budgetUsed = 0;
    let totalBudget = 0;
    
    if (budgets.length > 0) {
      totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
      
      // Collect all unique category IDs from budgets
      const budgetCategoryIds = budgets
        .map((b) => b.categoryId)
        .filter((id) => id !== null);
      
      // Get all expense transactions for the current month that match budget categories
      // or are directly linked to budgets
      const budgetIds = budgets.map((b) => b.id);
      
      // Build OR conditions for transactions
      const orConditions = [];
      
      // Add condition for transactions directly linked to budgets
      if (budgetIds.length > 0) {
        orConditions.push({
          budgetId: {
            in: budgetIds,
          },
        });
      }
      
      // Add condition for transactions matching budget categories
      if (budgetCategoryIds.length > 0) {
        orConditions.push({
          categoryId: {
            in: budgetCategoryIds,
          },
        });
      }
      
      // If no conditions, skip query
      if (orConditions.length > 0) {
        const budgetTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            type: "EXPENSE",
            status: "COMPLETED",
            isActive: true,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            OR: orConditions,
          },
          select: {
            id: true,
            amount: true,
            categoryId: true,
            budgetId: true,
          },
        });

        // Use a Set to track counted transaction IDs to avoid double-counting
        const countedTransactionIds = new Set();
        
        // Calculate total budget used by summing all unique transactions
        budgetUsed = budgetTransactions.reduce((sum, tx) => {
          // Only count each transaction once
          if (!countedTransactionIds.has(tx.id)) {
            countedTransactionIds.add(tx.id);
            return sum + Number(tx.amount);
          }
          return sum;
        }, 0);
      }
    }

    const expenseAmount = Number(totalExpense._sum.amount || 0);
    const incomeAmount = Number(totalIncome._sum.amount || 0);
    const savings = incomeAmount - expenseAmount;
    const budgetUsedPercent =
      totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;

    return {
      totalExpense: expenseAmount,
      totalIncome: incomeAmount,
      savings,
      biggestCategory,
      budgetUsedPercent,
      totalBudget,
      budgetUsed,
    };
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    throw new Error("Failed to fetch monthly summary");
  }
}

/**
 * Get expense distribution by category for pie/donut chart
 */
export async function getExpenseDistribution(userId, month, year) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const categoryExpenses = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get category details
    const categoryIds = categoryExpenses
      .map((item) => item.categoryId)
      .filter((id) => id !== null);

    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    const distribution = categoryExpenses
      .map((item) => {
        const category = categoryMap.get(item.categoryId);
        if (!category) return null;

        return {
          categoryId: item.categoryId,
          categoryName: category.name,
          amount: Number(item._sum.amount || 0),
          count: item._count.id,
          color: category.color || "#8884d8",
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.amount - a.amount);

    const total = distribution.reduce((sum, item) => sum + item.amount, 0);

    return distribution.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error fetching expense distribution:", error);
    throw new Error("Failed to fetch expense distribution");
  }
}

/**
 * Get monthly trends for line chart (expense, income, savings)
 */
export async function getMonthlyTrends(userId, months = 12) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Get all transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startDate,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by month
    const monthlyData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey,
          expense: 0,
          income: 0,
          savings: 0,
        };
      }

      const amount = Number(tx.amount);
      if (tx.type === "EXPENSE") {
        monthlyData[monthKey].expense += amount;
      } else if (tx.type === "INCOME") {
        monthlyData[monthKey].income += amount;
      }

      monthlyData[monthKey].savings =
        monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    // Convert to array and fill missing months
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      result.push(
        monthlyData[monthKey] || {
          month: monthLabel,
          monthKey,
          expense: 0,
          income: 0,
          savings: 0,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching monthly trends:", error);
    throw new Error("Failed to fetch monthly trends");
  }
}

/**
 * Get category trends over time (multi-line chart)
 */
export async function getCategoryTrends(userId, categoryIds, months = 12) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // If no categoryIds provided, get top 5 expense categories
    let topCategories = [];
    if (!categoryIds || categoryIds.length === 0) {
      const categoryTotals = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          status: "COMPLETED",
          isActive: true,
          date: {
            gte: startDate,
          },
          categoryId: {
            not: null,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 5,
      });

      topCategories = categoryTotals
        .map((item) => item.categoryId)
        .filter((id) => id !== null);
    } else {
      topCategories = categoryIds;
    }

    // Get category details
    const categories = await prisma.category.findMany({
      where: {
        id: { in: topCategories },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    // Get transactions for these categories
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        categoryId: { in: topCategories },
        date: {
          gte: startDate,
        },
      },
      select: {
        categoryId: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by month and category
    const monthlyData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey,
        };
        topCategories.forEach((catId) => {
          monthlyData[monthKey][catId] = 0;
        });
      }

      if (tx.categoryId) {
        monthlyData[monthKey][tx.categoryId] =
          (monthlyData[monthKey][tx.categoryId] || 0) + Number(tx.amount);
      }
    });

    // Convert to array and fill missing months
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      const monthData = monthlyData[monthKey] || {
        month: monthLabel,
        monthKey,
      };
      topCategories.forEach((catId) => {
        if (!monthData[catId]) {
          monthData[catId] = 0;
        }
      });

      result.push(monthData);
    }

    return {
      data: result,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color || "#8884d8",
      })),
    };
  } catch (error) {
    console.error("Error fetching category trends:", error);
    throw new Error("Failed to fetch category trends");
  }
}

/**
 * Get daily/weekly spending pattern
 */
export async function getDailySpendingPattern(userId, month, year, viewType = "dayOfWeek") {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    const pattern = {};

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const amount = Number(tx.amount);

      if (viewType === "dayOfWeek") {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[dayOfWeek];

        if (!pattern[dayName]) {
          pattern[dayName] = { amount: 0, count: 0 };
        }
        pattern[dayName].amount += amount;
        pattern[dayName].count += 1;
      } else {
        // dayOfMonth
        const day = date.getDate();
        if (!pattern[day]) {
          pattern[day] = { amount: 0, count: 0 };
        }
        pattern[day].amount += amount;
        pattern[day].count += 1;
      }
    });

    // Convert to array format
    if (viewType === "dayOfWeek") {
      const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return dayOrder.map((day) => ({
        label: day,
        value: day,
        amount: pattern[day]?.amount || 0,
        count: pattern[day]?.count || 0,
      }));
    } else {
      // dayOfMonth - return all days 1-31
      const result = [];
      for (let day = 1; day <= 31; day++) {
        result.push({
          label: `Day ${day}`,
          value: day,
          amount: pattern[day]?.amount || 0,
          count: pattern[day]?.count || 0,
        });
      }
      return result;
    }
  } catch (error) {
    console.error("Error fetching daily spending pattern:", error);
    throw new Error("Failed to fetch daily spending pattern");
  }
}

/**
 * Get cashflow data (income vs expense per month)
 */
export async function getCashflowData(userId, months = 12) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        isActive: true,
        type: { in: ["INCOME", "EXPENSE"] },
        date: {
          gte: startDate,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by month
    const monthlyData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey,
          income: 0,
          expense: 0,
        };
      }

      const amount = Number(tx.amount);
      if (tx.type === "INCOME") {
        monthlyData[monthKey].income += amount;
      } else if (tx.type === "EXPENSE") {
        monthlyData[monthKey].expense += amount;
      }
    });

    // Convert to array and fill missing months
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      result.push(
        monthlyData[monthKey] || {
          month: monthLabel,
          monthKey,
          income: 0,
          expense: 0,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching cashflow data:", error);
    throw new Error("Failed to fetch cashflow data");
  }
}

/**
 * Get budget progress (budget vs actual)
 */
export async function getBudgetProgress(userId, month, year) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: month,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        transactions: {
          where: {
            status: "COMPLETED",
            isActive: true,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    // Calculate overall budget
    const overallBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const overallSpent = budgets.reduce(
      (sum, budget) =>
        sum +
        budget.transactions.reduce((txSum, tx) => txSum + Number(tx.amount), 0),
      0
    );

    // Per category budgets
    const categoryBudgets = budgets.map((budget) => {
      const spent = budget.transactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      );
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.category?.name || "Uncategorized",
        categoryColor: budget.category?.color || "#8884d8",
        budgetAmount,
        spent,
        remaining: budgetAmount - spent,
        percentage,
      };
    });

    return {
      overall: {
        budgetAmount: overallBudget,
        spent: overallSpent,
        remaining: overallBudget - overallSpent,
        percentage: overallBudget > 0 ? Math.round((overallSpent / overallBudget) * 100) : 0,
      },
      categories: categoryBudgets,
    };
  } catch (error) {
    console.error("Error fetching budget progress:", error);
    throw new Error("Failed to fetch budget progress");
  }
}

/**
 * Get recurring expenses
 */
export async function getRecurringExpenses(userId) {
  try {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        amount: "desc",
      },
    });

    // Calculate monthly totals based on frequency
    const expenses = recurringTransactions.map((rt) => {
      let monthlyAmount = Number(rt.amount);
      
      switch (rt.frequency) {
        case "DAILY":
          monthlyAmount = monthlyAmount * 30;
          break;
        case "WEEKLY":
          monthlyAmount = monthlyAmount * 4;
          break;
        case "MONTHLY":
          // Already monthly
          break;
        case "YEARLY":
          monthlyAmount = monthlyAmount / 12;
          break;
      }

      return {
        id: rt.id,
        description: rt.description || "Recurring Expense",
        amount: Number(rt.amount),
        monthlyAmount,
        frequency: rt.frequency,
        categoryName: rt.category?.name || "Uncategorized",
        categoryColor: rt.category?.color || "#8884d8",
        bankAccountName: rt.bankAccount?.name || "Unknown",
        startDate: rt.startDate,
        endDate: rt.endDate,
      };
    });

    return expenses;
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    throw new Error("Failed to fetch recurring expenses");
  }
}

/**
 * Get debt/EMI overview
 */
export async function getDebtOverview(userId) {
  try {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
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
      orderBy: {
        amount: "desc",
      },
    });

    // Group by category and calculate monthly totals
    const debtByCategory = {};
    
    recurringTransactions.forEach((rt) => {
      const categoryName = rt.category?.name || "Uncategorized";
      const categoryColor = rt.category?.color || "#8884d8";
      
      if (!debtByCategory[categoryName]) {
        debtByCategory[categoryName] = {
          categoryName,
          categoryColor,
          totalAmount: 0,
          monthlyAmount: 0,
          count: 0,
          items: [],
        };
      }

      let monthlyAmount = Number(rt.amount);
      switch (rt.frequency) {
        case "DAILY":
          monthlyAmount = monthlyAmount * 30;
          break;
        case "WEEKLY":
          monthlyAmount = monthlyAmount * 4;
          break;
        case "MONTHLY":
          break;
        case "YEARLY":
          monthlyAmount = monthlyAmount / 12;
          break;
      }

      debtByCategory[categoryName].totalAmount += Number(rt.amount);
      debtByCategory[categoryName].monthlyAmount += monthlyAmount;
      debtByCategory[categoryName].count += 1;
      debtByCategory[categoryName].items.push({
        id: rt.id,
        description: rt.description,
        amount: Number(rt.amount),
        monthlyAmount,
        frequency: rt.frequency,
        startDate: rt.startDate,
        endDate: rt.endDate,
      });
    });

    return Object.values(debtByCategory).sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  } catch (error) {
    console.error("Error fetching debt overview:", error);
    throw new Error("Failed to fetch debt overview");
  }
}

/**
 * Get category insights
 */
export async function getCategoryInsights(userId, categoryId) {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get current month transactions
    const currentMonthTx = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: categoryId || undefined,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: currentMonthStart,
        },
      },
      select: {
        amount: true,
      },
    });

    // Get last month transactions
    const lastMonthTx = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: categoryId || undefined,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      select: {
        amount: true,
      },
    });

    // Get last 6 months for average
    const sixMonthsTx = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: categoryId || undefined,
        type: "EXPENSE",
        status: "COMPLETED",
        isActive: true,
        date: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Calculate monthly totals for last 6 months
    const monthlyTotals = {};
    sixMonthsTx.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0;
      }
      monthlyTotals[monthKey] += Number(tx.amount);
    });

    const totals = Object.values(monthlyTotals);
    const currentMonthTotal = currentMonthTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const lastMonthTotal = lastMonthTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const averageSpend = totals.length > 0 ? totals.reduce((sum, val) => sum + val, 0) / totals.length : 0;
    const highestMonth = totals.length > 0 ? Math.max(...totals) : 0;
    const lowestMonth = totals.length > 0 ? Math.min(...totals) : 0;

    const changeFromLastMonth =
      lastMonthTotal > 0
        ? Math.round(((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

    return {
      currentMonth: currentMonthTotal,
      lastMonth: lastMonthTotal,
      averageSpend,
      highestMonth,
      lowestMonth,
      changeFromLastMonth,
      transactionCount: currentMonthTx.length,
    };
  } catch (error) {
    console.error("Error fetching category insights:", error);
    throw new Error("Failed to fetch category insights");
  }
}


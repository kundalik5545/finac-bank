import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/db/db.config";
import { getBudgetStatus } from "@/lib/budget-alerts";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all active budgets for current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
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
      orderBy: [
        { categoryId: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    });

    if (!budgets || budgets.length === 0) {
      return NextResponse.json({
        overall: null,
        categories: [],
      });
    }

    // Find overall budget (categoryId is null)
    const overallBudget = budgets.find((b) => !b.categoryId);

    // Calculate overall budget status
    let overall = null;
    if (overallBudget) {
      const status = await getBudgetStatus(overallBudget);
      overall = {
        budgetAmount: Number(overallBudget.amount),
        spent: status.spent,
        remaining: status.remaining,
        percentage: status.percentage,
      };
    } else {
      // If no overall budget, calculate from all category budgets
      const categoryBudgets = budgets.filter((b) => b.categoryId);
      if (categoryBudgets.length > 0) {
        let totalBudget = 0;
        let totalSpent = 0;

        for (const budget of categoryBudgets) {
          const status = await getBudgetStatus(budget);
          totalBudget += Number(budget.amount);
          totalSpent += status.spent;
        }

        const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const remaining = totalBudget - totalSpent;

        overall = {
          budgetAmount: totalBudget,
          spent: totalSpent,
          remaining,
          percentage,
        };
      }
    }

    // Calculate category budgets
    const categoryBudgets = budgets.filter((b) => b.categoryId);
    const categories = await Promise.all(
      categoryBudgets.map(async (budget) => {
        const status = await getBudgetStatus(budget);
        return {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.category?.name || "Unknown",
          categoryColor: budget.category?.color || null,
          budgetAmount: Number(budget.amount),
          spent: status.spent,
          remaining: status.remaining,
          percentage: status.percentage,
        };
      })
    );

    return NextResponse.json({
      overall,
      categories,
    });
  } catch (error) {
    console.error("Error fetching budget progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget progress" },
      { status: 500 }
    );
  }
}


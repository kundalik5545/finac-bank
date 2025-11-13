import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/db/db.config";
import { checkAndSendBudgetAlerts } from "@/lib/budget-alerts";

/**
 * Test endpoint to manually trigger budget alerts
 * Usage: GET /api/test/budget-alert?budgetId=<budget-id>
 * Or: GET /api/test/budget-alert (will test all active budgets for current user)
 */
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
    const budgetId = searchParams.get("budgetId");

    if (budgetId) {
      // Test specific budget
      const budget = await prisma.budget.findFirst({
        where: {
          id: budgetId,
          userId: session.user.id,
        },
      });

      if (!budget) {
        return NextResponse.json(
          { error: "Budget not found" },
          { status: 404 }
        );
      }

      const result = await checkAndSendBudgetAlerts(budgetId, session.user.id);
      
      return NextResponse.json({
        message: "Budget alert test completed",
        budgetId,
        result,
      });
    } else {
      // Test all active budgets for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const budgets = await prisma.budget.findMany({
        where: {
          userId: session.user.id,
          isActive: true,
          month: currentMonth,
          year: currentYear,
        },
      });

      const results = [];

      for (const budget of budgets) {
        try {
          const result = await checkAndSendBudgetAlerts(budget.id, session.user.id);
          results.push({
            budgetId: budget.id,
            categoryId: budget.categoryId,
            amount: Number(budget.amount),
            alertThreshold: budget.alertThreshold,
            result,
          });
        } catch (error) {
          console.error(`Error testing budget ${budget.id}:`, error);
          results.push({
            budgetId: budget.id,
            success: false,
            error: error.message,
          });
        }
      }

      return NextResponse.json({
        message: "Budget alerts test completed",
        checked: budgets.length,
        results,
      });
    }
  } catch (error) {
    console.error("Error in budget alert test:", error);
    return NextResponse.json(
      { error: "Failed to test budget alerts", details: error.message },
      { status: 500 }
    );
  }
}


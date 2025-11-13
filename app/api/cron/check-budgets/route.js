import { NextResponse } from "next/server";
import prisma from "@/db/db.config";
import { checkAndSendBudgetAlerts } from "@/lib/budget-alerts";

/**
 * Cron job to check all active budgets and send alerts
 * Can be triggered manually or scheduled via Vercel Cron
 */
export async function GET(request) {
  try {
    // Optional: Add authentication/authorization check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get all active budgets for current month
    const budgets = await prisma.budget.findMany({
      where: {
        isActive: true,
        month: currentMonth,
        year: currentYear,
      },
      include: {
        user: {
          include: {
            userPreferences: true,
          },
        },
      },
    });

    const results = [];

    for (const budget of budgets) {
      try {
        const result = await checkAndSendBudgetAlerts(budget.id, budget.userId);
        results.push({
          budgetId: budget.id,
          categoryId: budget.categoryId,
          success: result.sent,
          alertType: result.alertType,
          channel: result.channel,
        });
      } catch (error) {
        console.error(`Error checking budget ${budget.id}:`, error);
        results.push({
          budgetId: budget.id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Budget check completed",
        checked: budgets.length,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in budget check cron job:", error);
    return NextResponse.json({ error: "Failed to check budgets" }, { status: 500 });
  }
}


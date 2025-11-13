import prisma from "@/db/db.config";
import { sendBudgetAlertEmail } from "@/lib/email";
import { sendBudgetAlertTelegram } from "@/lib/telegram";
import { checkBudgetStatus } from "@/action/budget";

/**
 * Get budget status (percentage used)
 */
export async function getBudgetStatus(budget) {
  try {
    const budgetAmount = Number(budget.amount);
    const budgetMonth = budget.month;
    const budgetYear = budget.year;

    // Get transactions for this budget period
    const startDate = new Date(budgetYear, (budgetMonth || 1) - 1, 1);
    const endDate = new Date(budgetYear, budgetMonth || 12, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: budget.userId,
        status: "COMPLETED",
        isActive: true,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(budget.categoryId && { categoryId: budget.categoryId }),
      },
    });

    const spent = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
    const remaining = budgetAmount - spent;

    return {
      spent,
      remaining,
      percentage,
      budgetAmount,
    };
  } catch (error) {
    console.error("Error getting budget status:", error);
    throw error;
  }
}

/**
 * Check if alert should be sent (rate limiting)
 */
export async function shouldSendAlert(budget, alertType) {
  try {
    // Check if alert was sent today for this budget and alert type
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentAlert = await prisma.budgetAlert.findFirst({
      where: {
        budgetId: budget.id,
        alertType,
        sentAt: {
          gte: today,
        },
      },
    });

    if (recentAlert) {
      return false; // Already sent today
    }

    // Also check lastAlertSent on budget
    if (budget.lastAlertSent) {
      const lastAlertDate = new Date(budget.lastAlertSent);
      lastAlertDate.setHours(0, 0, 0, 0);

      if (lastAlertDate.getTime() === today.getTime()) {
        return false; // Already sent today
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking if alert should be sent:", error);
    return false; // Fail safe - don't send if error
  }
}

/**
 * Check and send budget alerts
 */
export async function checkAndSendBudgetAlerts(budgetId, userId) {
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
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
          include: {
            userPreferences: true,
          },
        },
      },
    });

    if (!budget || !budget.isActive) {
      return { sent: false, reason: "Budget not found or inactive" };
    }

    // Get budget status
    const status = await getBudgetStatus(budget);
    const percentage = status.percentage;

    // Determine alert type
    let alertType = null;
    if (percentage >= 100) {
      alertType = "EXCEEDED";
    } else if (percentage >= budget.alertThreshold) {
      alertType = "WARNING";
    }

    if (!alertType) {
      return { sent: false, reason: "No alert needed" };
    }

    // Check if alert should be sent (rate limiting)
    const shouldSend = await shouldSendAlert(budget, alertType);
    if (!shouldSend) {
      return { sent: false, reason: "Alert already sent today" };
    }

    // Get user preferences
    const preferences = budget.user.userPreferences;
    const sendEmail = preferences?.emailNotifications && preferences?.budgetAlerts;
    const sendTelegram = preferences?.telegramNotifications && preferences?.budgetAlerts && preferences?.telegramChatId;

    if (!sendEmail && !sendTelegram) {
      return { sent: false, reason: "User has notifications disabled" };
    }

    const budgetData = {
      budget,
      status: alertType,
      percentage,
      spent: status.spent,
      remaining: status.remaining,
      categoryName: budget.category?.name || "Overall Budget",
    };

    let emailSent = false;
    let telegramSent = false;
    let channel = null;

    // Send email
    if (sendEmail) {
      const emailResult = await sendBudgetAlertEmail(budget.user.email, budgetData);
      emailSent = emailResult.success;
    }

    // Send Telegram
    if (sendTelegram) {
      const telegramResult = await sendBudgetAlertTelegram(preferences.telegramChatId, budgetData);
      telegramSent = telegramResult.success;
    }

    // Determine channel
    if (emailSent && telegramSent) {
      channel = "BOTH";
    } else if (emailSent) {
      channel = "EMAIL";
    } else if (telegramSent) {
      channel = "TELEGRAM";
    }

    // Record alert in database
    if (emailSent || telegramSent) {
      await prisma.budgetAlert.create({
        data: {
          budgetId: budget.id,
          alertType,
          channel: channel || "EMAIL",
        },
      });

      // Update lastAlertSent on budget
      await prisma.budget.update({
        where: { id: budget.id },
        data: {
          lastAlertSent: new Date(),
        },
      });
    }

    return {
      sent: emailSent || telegramSent,
      emailSent,
      telegramSent,
      alertType,
      channel,
    };
  } catch (error) {
    console.error("Error checking and sending budget alerts:", error);
    return { sent: false, error: error.message };
  }
}


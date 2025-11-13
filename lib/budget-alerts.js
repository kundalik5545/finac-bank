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
    const percentage =
      budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
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
    let budget = await prisma.budget.findFirst({
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
    let preferences = budget.user.userPreferences;

    // If preferences don't exist, create default ones
    if (!preferences) {
      console.warn(
        "User preferences not found, creating defaults for user:",
        userId
      );
      await prisma.userPreference.create({
        data: {
          userId: userId,
          currency: "INR",
          emailNotifications: true,
          budgetAlerts: true,
          telegramNotifications: false,
          budgetAlertThreshold: 80,
        },
      });
      // Refetch budget with new preferences
      const updatedBudget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
        include: {
          category: { select: { id: true, name: true, color: true } },
          user: {
            select: { id: true, email: true, name: true },
            include: { userPreferences: true },
          },
        },
      });
      if (updatedBudget) {
        budget = updatedBudget;
        preferences = updatedBudget.user.userPreferences;
      }
    }

    const finalPreferences = budget.user.userPreferences || preferences;
    const sendEmail =
      finalPreferences?.emailNotifications && finalPreferences?.budgetAlerts;
    const sendTelegram =
      finalPreferences?.telegramNotifications &&
      finalPreferences?.budgetAlerts &&
      finalPreferences?.telegramChatId;

    if (!sendEmail && !sendTelegram) {
      console.log("Notifications disabled:", {
        emailNotifications: finalPreferences?.emailNotifications,
        budgetAlerts: finalPreferences?.budgetAlerts,
        telegramNotifications: finalPreferences?.telegramNotifications,
        telegramChatId: finalPreferences?.telegramChatId,
      });
      return {
        sent: false,
        reason: "User has notifications disabled",
        details: {
          emailNotifications: finalPreferences?.emailNotifications,
          budgetAlerts: finalPreferences?.budgetAlerts,
          telegramNotifications: finalPreferences?.telegramNotifications,
          hasTelegramChatId: !!finalPreferences?.telegramChatId,
        },
      };
    }

    const budgetData = {
      budget,
      status: alertType,
      percentage,
      spent: status.spent,
      remaining: status.remaining,
      categoryName: budget.category?.name || "Overall Budget",
    };

    console.log("Budget alert data:", {
      budgetId: budget.id,
      userId: userId,
      alertType,
      percentage,
      userEmail: budget.user.email,
      sendEmail,
      sendTelegram,
      telegramChatId: finalPreferences?.telegramChatId,
      emailNotifications: finalPreferences?.emailNotifications,
      budgetAlerts: finalPreferences?.budgetAlerts,
    });

    let emailSent = false;
    let telegramSent = false;
    let channel = null;

    // Send email
    if (sendEmail) {
      try {
        const emailResult = await sendBudgetAlertEmail(
          budget.user.email,
          budgetData
        );
        emailSent = emailResult.success;
        if (!emailSent) {
          console.error("Failed to send email:", emailResult.error);
        } else {
          console.log("Email sent successfully to:", budget.user.email);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        emailSent = false;
      }
    }

    // Send Telegram
    if (sendTelegram) {
      try {
        const telegramChatId = finalPreferences?.telegramChatId;
        if (!telegramChatId) {
          console.error("Telegram chat ID not found in preferences");
          telegramSent = false;
        } else {
          const telegramResult = await sendBudgetAlertTelegram(
            telegramChatId,
            budgetData
          );
          telegramSent = telegramResult.success;
          if (!telegramSent) {
            console.error(
              "Failed to send Telegram message:",
              telegramResult.error
            );
          } else {
            console.log(
              "Telegram message sent successfully to chat:",
              telegramChatId
            );
          }
        }
      } catch (error) {
        console.error("Error sending Telegram message:", error);
        telegramSent = false;
      }
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

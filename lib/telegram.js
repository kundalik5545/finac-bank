/**
 * Send Telegram message using Bot API
 */
export async function sendTelegramMessage(chatId, message) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn("TELEGRAM_BOT_TOKEN not configured, skipping Telegram message");
      return { success: false, error: "Telegram service not configured" };
    }

    if (!chatId) {
      console.warn("Chat ID not provided, skipping Telegram message");
      return { success: false, error: "Chat ID not provided" };
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML", // Support HTML formatting
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", {
        status: response.status,
        error: data.description,
        fullResponse: data,
      });
      return { success: false, error: data.description || "Failed to send message" };
    }

    console.log("Telegram message sent successfully:", data.result.message_id);
    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send budget alert via Telegram
 */
export async function sendBudgetAlertTelegram(chatId, budgetData) {
  try {
    const { budget, status, percentage, spent, remaining, categoryName } = budgetData;

    const budgetAmount = Number(budget.amount);
    const overspent = status === "EXCEEDED" ? Math.abs(remaining) : 0;

    const emoji = status === "EXCEEDED" ? "🚨" : "⚠️";
    const statusText = status === "EXCEEDED" ? "EXCEEDED" : "WARNING";

    const message = `
${emoji} <b>Budget ${statusText}</b>

📊 <b>Category:</b> ${categoryName || "Overall Budget"}
💰 <b>Budget Amount:</b> ₹${budgetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
💸 <b>Amount Spent:</b> ₹${spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
📈 <b>Usage:</b> ${percentage}%

${status === "EXCEEDED" ? `❌ <b>Over Budget:</b> ₹${overspent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `✅ <b>Remaining:</b> ₹${remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}

${status === "EXCEEDED" ? "⚠️ Your budget has been exceeded. Please review your expenses." : "⚠️ You're approaching your budget limit. Monitor your spending carefully."}
    `.trim();

    return await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error("Error sending budget alert via Telegram:", error);
    return { success: false, error: error.message };
  }
}


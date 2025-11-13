import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send budget alert email
 */
export async function sendBudgetAlertEmail(userEmail, budgetData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, error: "Email service not configured" };
    }

    const { budget, status, percentage, spent, remaining, categoryName } =
      budgetData;

    const subject =
      status === "EXCEEDED"
        ? `🚨 Budget Exceeded: ${categoryName || "Overall Budget"}`
        : `⚠️ Budget Warning: ${categoryName || "Overall Budget"}`;

    const budgetAmount = Number(budget.amount);
    const overspent = status === "EXCEEDED" ? Math.abs(remaining) : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${
              status === "EXCEEDED" ? "#dc2626" : "#f59e0b"
            }; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .budget-info { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .stat { display: flex; justify-content: space-between; margin: 10px 0; }
            .stat-label { font-weight: 600; }
            .stat-value { font-weight: 700; color: ${
              status === "EXCEEDED" ? "#dc2626" : "#f59e0b"
            }; }
            .progress-bar { width: 100%; height: 20px; background-color: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 15px 0; }
            .progress-fill { height: 100%; background-color: ${
              status === "EXCEEDED" ? "#dc2626" : "#f59e0b"
            }; width: ${Math.min(percentage, 100)}%; }
            .recommendations { background-color: #eff6ff; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${
                status === "EXCEEDED"
                  ? "🚨 Budget Exceeded"
                  : "⚠️ Budget Warning"
              }</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your budget for <strong>${
                categoryName || "Overall Budget"
              }</strong> has ${
      status === "EXCEEDED" ? "been exceeded" : "reached a warning threshold"
    }.</p>
              
              <div class="budget-info">
                <div class="stat">
                  <span class="stat-label">Budget Amount:</span>
                  <span class="stat-value">₹${budgetAmount.toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 }
                  )}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Amount Spent:</span>
                  <span class="stat-value">₹${spent.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Usage:</span>
                  <span class="stat-value">${percentage}%</span>
                </div>
                ${
                  status === "EXCEEDED"
                    ? `
                <div class="stat">
                  <span class="stat-label">Over Budget:</span>
                  <span class="stat-value">₹${overspent.toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 }
                  )}</span>
                </div>
                `
                    : `
                <div class="stat">
                  <span class="stat-label">Remaining:</span>
                  <span class="stat-value">₹${remaining.toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 }
                  )}</span>
                </div>
                `
                }
                
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
              </div>

              ${
                status === "EXCEEDED"
                  ? `
              <div class="recommendations">
                <h3>💡 Recommendations:</h3>
                <ul>
                  <li>Review your recent expenses in this category</li>
                  <li>Consider adjusting your budget for next month</li>
                  <li>Look for ways to reduce spending in this category</li>
                  <li>Track your expenses more closely to avoid overruns</li>
                </ul>
              </div>
              `
                  : `
              <div class="recommendations">
                <h3>💡 Recommendations:</h3>
                <ul>
                  <li>You're approaching your budget limit</li>
                  <li>Monitor your spending carefully for the rest of the month</li>
                  <li>Consider reducing non-essential expenses</li>
                </ul>
              </div>
              `
              }

              <p>Best regards,<br>Finac Bank Team</p>
            </div>
            <div class="footer">
              <p>This is an automated alert from your budget tracking system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      return { success: false, error: "Email service not configured" };
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Finac Bank <budgets@finacbank.com>";

    console.log("Sending email:", {
      from: fromEmail,
      to: userEmail,
      subject,
      hasApiKey: !!process.env.RESEND_API_KEY,
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    console.log("Email sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending budget alert email:", error);
    return { success: false, error: error.message };
  }
}

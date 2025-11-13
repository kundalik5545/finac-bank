# Testing Budget Alert Functionality

## Prerequisites

1. **Environment Variables** - Make sure these are set in your `local.env` file:
   ```env
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL="Your Name <your-email@yourdomain.com>"
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token (optional, for Telegram testing)
   ```

2. **User Preferences** - Ensure your user has:
   - `emailNotifications: true`
   - `budgetAlerts: true`
   - For Telegram: `telegramNotifications: true` and `telegramChatId` set

3. **Active Budget** - Create a budget that:
   - Is active (`isActive: true`)
   - Has transactions that exceed the alert threshold (default 80%)
   - Or has transactions that exceed 100% of the budget

## Testing Methods

### Method 1: Test API Endpoint (Recommended)

#### Test All Budgets for Current User
```bash
# Make sure you're logged in, then visit:
GET http://localhost:3000/api/test/budget-alert
```

#### Test Specific Budget
```bash
GET http://localhost:3000/api/test/budget-alert?budgetId=<budget-id>
```

**Response will include:**
- Whether email was sent successfully
- Whether Telegram message was sent successfully
- Alert type (WARNING or EXCEEDED)
- Any error messages

### Method 2: Create/Update Transaction

1. Create a transaction that will exceed your budget threshold
2. The system will automatically check and send alerts
3. Check server logs for email/telegram sending status

### Method 3: Cron Job Endpoint

```bash
GET http://localhost:3000/api/cron/check-budgets
# Optional: Add authorization header if CRON_SECRET is set
Authorization: Bearer <your-cron-secret>
```

## Debugging

### Check Server Logs

The system now logs detailed information:
- Budget alert data (budgetId, alertType, percentage, userEmail)
- Email sending status (from, to, subject, success/failure)
- Telegram sending status (chatId, success/failure)
- Any errors encountered

### Common Issues

1. **Email not sending:**
   - Check `RESEND_API_KEY` is set correctly
   - Verify `RESEND_FROM_EMAIL` uses a verified domain
   - Check user has `emailNotifications: true` and `budgetAlerts: true`
   - Check server logs for Resend API errors

2. **Telegram not sending:**
   - Check `TELEGRAM_BOT_TOKEN` is set
   - Verify `telegramChatId` is set in user preferences
   - Check user has `telegramNotifications: true` and `budgetAlerts: true`
   - Check server logs for Telegram API errors

3. **Alert not triggered:**
   - Verify budget is active (`isActive: true`)
   - Check budget percentage exceeds `alertThreshold` (default 80%)
   - Verify no alert was sent today (rate limiting)
   - Check user preferences are enabled

4. **Rate Limiting:**
   - Only one alert per day per budget per alert type
   - To test again, either:
     - Wait until tomorrow
     - Delete the `BudgetAlert` record from database
     - Update `budget.lastAlertSent` to yesterday

## Verification Steps

1. **Check User Preferences:**
   ```sql
   SELECT * FROM "UserPreference" WHERE "userId" = '<your-user-id>';
   ```

2. **Check Budget Status:**
   - Visit `/budgets` page
   - Check if budget shows percentage above threshold

3. **Check Alert History:**
   ```sql
   SELECT * FROM "BudgetAlert" ORDER BY "sentAt" DESC LIMIT 10;
   ```

4. **Check Email:**
   - Check your email inbox (and spam folder)
   - Subject: "🚨 Budget Exceeded" or "⚠️ Budget Warning"

5. **Check Telegram:**
   - Check your Telegram chat with the bot
   - Should receive formatted message with budget details

## Test Checklist

- [ ] Environment variables configured
- [ ] User preferences enabled (emailNotifications, budgetAlerts)
- [ ] Active budget exists with transactions
- [ ] Budget percentage exceeds threshold
- [ ] Test endpoint called successfully
- [ ] Email received (check inbox and spam)
- [ ] Telegram message received (if configured)
- [ ] Server logs show success messages
- [ ] BudgetAlert record created in database


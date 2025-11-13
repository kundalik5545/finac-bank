# Budget Management with Email and Telegram Alerts

## Overview

Implement a complete budget management system with:

- Full CRUD operations for budgets (create, read, update, delete)
- Real-time budget tracking and progress monitoring
- **Email alerts** for budget warnings and overruns (using **Resend**)
- **Telegram alerts** for instant budget notifications (using **Telegram Bot API — completely free**)
- Automatic budget validation during transaction creation
- User preferences for alert channels and thresholds

## Database Schema Updates

### Budget Model Enhancements

Add the following fields:

- `year` – integer (because currently only month exists)
- `alertThreshold` – percentage to trigger warning (default: 80%)
- `lastAlertSent` – timestamp to avoid spamming users
- `isActive` – allow enabling/disabling a budget

### New Model: BudgetAlert

Tracks alert history:

- `budgetId`
- `alertType` (e.g., WARNING, EXCEEDED)
- `sentAt`
- `channel` (EMAIL, TELEGRAM, BOTH)

Purpose:

- Avoid duplicate alerts
- Track user notification history

### UserPreference Model Updates

Add:

- `telegramChatId` – user's chat ID with your bot
- `budgetAlertThreshold` – default 80%
- `telegramNotifications` – boolean toggle

## Implementation Steps

### 1. Database Schema Updates

**File:** `prisma/schema.prisma`

Add fields to Budget model:

- `year Int?`
- `alertThreshold Int @default(80)`
- `lastAlertSent DateTime?`
- `isActive Boolean @default(true)`

Create new model:

- `BudgetAlert` with fields: `id`, `budgetId`, `alertType`, `sentAt`, `channel`

Update `UserPreference` model with:

- `telegramChatId String?`
- `telegramNotifications Boolean @default(false)`
- `budgetAlertThreshold Int @default(80)`

### 2. Budget Management API Routes

**Files:**

- `app/api/budgets/route.js` - GET (list), POST (create)
- `app/api/budgets/[id]/route.js` - GET (single), PATCH (update), DELETE

**Features:**

- List budgets (filter by month/year/category)
- Create budgets with validation (check for duplicates)
- Update budgets (amounts, settings, thresholds)
- Delete budgets (soft/hard delete)
- Return budget progress (spent vs limit)

### 3. Budget Server Actions

**File:** `action/budget.js`

Functions:

- `createBudget()` - Create new budget
- `updateBudget()` - Update existing budget
- `deleteBudget()` - Delete budget
- `getBudgets()` - Get all budgets for user
- `getBudgetById()` - Get single budget with progress
- `checkBudgetStatus()` - Check if budget is exceeded/warning
- `updateBudgetTotals()` - Recalculate budget totals from transactions

### 4. Budget Validation Schemas

**File:** `lib/formSchema.js`

Schemas:

- `addBudgetSchema` - Validation for creating budgets
- `updateBudgetSchema` - Validation for updating budgets

Include fields:

- amount
- month
- year
- categoryId
- alertThreshold
- description

### 5. Email Service Integration (Resend)

**File:** `lib/email.js`

- Install `resend` package
- Function: `sendBudgetAlertEmail(userEmail, budgetData)`
- Include in email:
  - Budget info (category, amount, month/year)
  - Usage percentage
  - Amount overspent (if exceeded)
  - Recommendations

**Environment variable:**

```
RESEND_API_KEY=re_xxxxx
```

### 6. Telegram Bot Integration (FREE)

**File:** `lib/telegram.js`

Use **Telegram Bot API** — completely free.

**Functions to implement:**

- `sendTelegramMessage(chatId, message)` - Send Telegram message when budget exceeded
- Use Bot token + chatId
- Alerts sent for:
  - Threshold warning (e.g., 80%)
  - Budget exceeded (100%+)

**Environment variables:**

```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**How users get chatId:**

- Option 1: User starts the bot on Telegram (`/start` command), bot captures `chatId` via webhook
- Option 2: Create API endpoint `/api/telegram/connect` where user can input their chatId manually
- Option 3: User can get chatId from @userinfobot on Telegram and enter it in settings
- Save to `UserPreference.telegramChatId`

**Implementation note:** Can use native `fetch` API (no package needed) or optionally install `axios` for convenience.

### 7. Budget Alert Service

**File:** `lib/budget-alerts.js`

Functions:

- `checkAndSendBudgetAlerts(budgetId, userId)` - Main function to check budgets and send alerts
- `shouldSendAlert(budget, alertType)` - Check if alert should be sent (rate limiting, thresholds)
- `getBudgetStatus(budget)` - Calculate current budget status (percentage used)

Integrate:

- Email service
- Telegram service
- BudgetAlert model (record alerts to prevent duplicates)

Alert types:

- **WARNING**: percentage >= alertThreshold (e.g., 80%)
- **EXCEEDED**: 100%+

### 8. Transaction Integration

**File:** `app/api/transactions/route.js`

After creating a transaction:

- Check if corresponding budget exists (category/month/year)
- If budget exists, update budget totals
- Check if budget threshold exceeded and trigger alerts
- Link transaction to budget via `budgetId` field

**File:** `app/api/transactions/[id]/route.js`

On update/delete:

- Recalculate budget totals for affected budgets
- Re-check budget status and send alerts if needed

### 9. Budget Management UI Pages

**Files:**

- `app/(main)/budgets/page.jsx` - List all budgets with progress indicators
- `app/(main)/budgets/add/page.jsx` - Create new budget form
- `app/(main)/budgets/edit/[id]/page.jsx` - Edit budget form
- `app/(main)/budgets/_components/BudgetCard.jsx` - Budget card component
- `app/(main)/budgets/_components/BudgetTable.jsx` - Budget table with progress
- `app/(main)/budgets/_components/BudgetForm.jsx` - Reusable budget form component

**Features:**

- Display budget progress with visual indicators (progress bars)
- Color coding: green (<80%), yellow (80-99%), red (100%+)
- Show remaining amount or over-budget amount
- Quick actions: edit, delete, view transactions

### 10. Settings Integration

**File:** `app/(main)/settings/page.jsx`

Add budget alert preferences section:

- Toggle email notifications for budgets
- Toggle Telegram notifications for budgets
- Input field for Telegram Chat ID (with instructions on how to get it)
- Set default budget alert threshold
- Optional: Add "Connect Telegram" button with instructions

### 11. Background Job for Budget Checks (Optional)

**File:** `app/api/cron/check-budgets/route.js`

- Daily scheduled job (Vercel Cron or similar) to check all active budgets
- Send summary alerts for budgets approaching limits
- Can be triggered via API route for manual testing

### 12. Sidebar Navigation

**File:** `components/AppLayout/AppSidebar.jsx`

- Add "Budgets" menu item linking to `/budgets`

## Technical Considerations

### Email Service (Resend)

- Free tier: 3,000 emails/month
- Simple API, good deliverability
- Environment variable: `RESEND_API_KEY`
- From email: Configure in Resend dashboard

### Telegram Bot Service

- **100% free** - no cost per message
- No approval process required
- Simple setup: Create bot via @BotFather on Telegram
- Environment variable: `TELEGRAM_BOT_TOKEN`
- Users need to start the bot and share their chatId
- Instant delivery, no rate limits for reasonable usage
- Can use native `fetch` API (no package needed) or optionally install `axios` for convenience

### Alert Rate Limiting

- Prevent spam: Only send one alert per budget per day
- Track in `BudgetAlert` model with `sentAt` timestamp
- Check `lastAlertSent` before sending new alerts

### Budget Calculation Rules

- Only count **COMPLETED** transactions
- Only count **EXPENSE** type transactions
- Filter by transaction date within budget month/year
- Update totals when transactions are created/updated/deleted

## Environment Variables Required

```
RESEND_API_KEY=re_xxxxx
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Getting Telegram Bot Token:**

1. Message @BotFather on Telegram
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy the token provided
5. Add to environment variables

## Dependencies to Install

```json
{
  "resend": "^3.0.0"
}
```

**Note:** Telegram Bot API can be used with native `fetch` (no package needed), or optionally install `axios` for convenience:

```json
{
  "axios": "^1.6.0"
}
```

## Testing Considerations

- Test budget creation with duplicate month/category/year combinations
- Test alert triggers at different thresholds (80%, 100%)
- Test email delivery with Resend
- Test Telegram delivery (requires bot token and user chatId)
- Test rate limiting (prevent duplicate alerts)
- Test budget recalculation when editing/deleting transactions
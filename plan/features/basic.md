Corrected sentence:

> I am building a finance-tracking application. I am using Next.js with TypeScript, Prisma, PostgreSQL, shadcn, and Tailwind CSS. Help me plan the application functionality.

Nice — great stack. Below is a compact, developer-friendly plan you can use to scope an MVP and then iterate. I include feature priorities, suggested Prisma models, API/page structure, UI components, auth/infra notes, and a 4-sprint roadmap.

# 1 — MVP (must-have)

Focus on these first so you ship something useful quickly.

- User auth (sign up / sign in / email verification)
- Add / edit / delete accounts (bank, cash, credit card)
- Add / edit / delete transactions (amount, date, account, category, merchant, note)
- Categories & tags (to organize transactions)
- Simple dashboard with balance per account and recent transactions
- CSV import/export of transactions
- Basic reports: monthly income vs expense, category breakdown (pie)
- Responsive UI using shadcn + Tailwind
- Prisma + Postgres data persistence
- Server-side rendering / API routes via Next.js (app or pages router)

# 2 — Nice-to-have (post-MVP)

- Recurring transactions and scheduled transactions
- Budgets per category (with notifications when near/over)
- Multi-currency support + stored exchange rates
- Receipt/photo uploads for transactions
- Transaction rules/auto-categorization (e.g., merchant => category)
- CSV bank statement parsing helpers (automated mapping)
- Export PDF reports
- Account aggregation via Plaid-like integrations (3rd party)
- User settings, preferences, themes, export backup
- Role-based access (if team/shared accounts)

# 3 — Prisma schema (suggested models)

Use these as a starting point. Tweak fields to your needs.

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String?
  passwordHash   String?   // if using credentials
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  accounts       Account[]
  transactions   Transaction[]
  settings       UserSettings?
}

model Account {
  id            String    @id @default(uuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  name          String
  type          AccountType
  currency      String    // ISO code, e.g., "USD"
  balance       Float     @default(0)
  institution   String?
  lastSyncedAt  DateTime?
  createdAt     DateTime  @default(now())
  transactions  Transaction[]
}

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  CASH
  INVESTMENT
}

model Category {
  id         String    @id @default(uuid())
  user       User?     @relation(fields: [userId], references: [id])
  userId     String?
  name       String
  type       CategoryType
  color      String?
  parentId   String?
  createdAt  DateTime  @default(now())
  transactions Transaction[]
}

enum CategoryType {
  INCOME
  EXPENSE
  TRANSFER
}

model Tag {
  id    String @id @default(uuid())
  name  String
  user  User?  @relation(fields: [userId], references: [id])
  userId String?
  transactions Transaction[] @relation("TransactionTags", references: [id])
}

model Transaction {
  id             String    @id @default(uuid())
  user           User      @relation(fields: [userId], references: [id])
  userId         String
  account        Account   @relation(fields: [accountId], references: [id])
  accountId      String
  amount         Float
  currency       String
  date           DateTime
  type           TransactionType
  category       Category? @relation(fields: [categoryId], references: [id])
  categoryId     String?
  merchant       String?
  note           String?
  tags           Tag[]     @relation("TransactionTags")
  isReconciled   Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

enum TransactionType {
  DEBIT
  CREDIT
  TRANSFER
}

model Budget {
  id           String   @id @default(uuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  category     Category @relation(fields: [categoryId], references: [id])
  categoryId   String
  amount       Float
  startDate    DateTime
  endDate      DateTime?
  createdAt    DateTime @default(now())
}
```

# 4 — API routes / backend responsibilities

- `POST /api/auth/*` — auth (or use NextAuth/Clerk)
- `GET /api/accounts` / `POST /api/accounts` / `PATCH /api/accounts/:id` / `DELETE /api/accounts/:id`
- `GET /api/transactions` with filters (accountId, categoryId, dateFrom, dateTo, tag, search)
- `POST /api/transactions` / `PATCH /api/transactions/:id` / `DELETE /api/transactions/:id`
- `POST /api/import/csv` — CSV upload + mapping
- `GET /api/reports/monthly` — aggregated data
- `POST /api/recurring` — schedule logic
- `GET /api/settings` / `PATCH /api/settings`
- Webhooks for third-party integrations (Plaid-like) and scheduled job endpoints

# 5 — Frontend pages & components (Next.js + shadcn)

Pages:

- `/` — Dashboard (balances, charts, recent tx)
- `/accounts` — list & create accounts
- `/transactions` — ledger view + filters + search
- `/transactions/new` — quick add transaction modal/page
- `/categories` — manage categories
- `/reports` — reports & export
- `/settings` — user prefs, export data, connected apps

Reusable components (shadcn/Tailwind):

- `AccountCard`, `TransactionRow`, `TransactionForm`, `CategorySelect`, `TagPill`, `DateRangePicker`, `CsvImporter`, `ChartCard` (use recharts if needed), `Modal`, `Toast/Notification`.

UI patterns:

- Use modal or drawer for transaction create/edit.
- Inline editing for small fields (reconciliation toggle).
- Bulk-select for transactions to categorize or delete.
- Save common filters as presets.

# 6 — Auth & security

- Use Better Auth for fast, secure auth (supports OAuth, magic links).
- Encrypt sensitive data at rest if storing tokens or third-party credentials.
- Store JWT or session tokens securely (httpOnly cookies).
- Add rate-limiting for API endpoints.
- Ensure DB users have least privilege; use migrations for schema changes.

# 7 — Background jobs & scheduling

- Use a job queue (e.g., BullMQ with Redis) or serverless cron (e.g., Vercel scheduled functions / AWS EventBridge) for:

  - Recurring transactions
  - Syncing accounts (3rd party)
  - Sending summary emails / notifications
  - Exchange rate updates

# 8 — Testing & quality

- Unit tests: Jest + React Testing Library
- Integration tests: Cypress or Playwright (especially flows like CSV import)
- Type-checking: strict `tsconfig` + linting (ESLint + Prettier)
- Prisma: use `prisma db push`/migrate in CI; use a test DB for integration tests.

# 9 — Observability & monitoring

- Error tracking: Sentry
- Logging: structured logs (e.g., pino) + central aggregator
- Performance: Lighthouse checks for pages, RUM (Real User Monitoring)
- Analytics: Simple event tracking for feature usage

# 10 — Deployment & infra

- Host on Vercel (great for Next.js), or Netlify / Render
- Postgres: managed DB (Supabase, Neon, RDS)
- Use environment secrets: DATABASE_URL, NEXTAUTH secrets, API keys
- Backups: automated DB backups + export feature for users

# 11 — Sample 8-week roadmap (4 two-week sprints)

Sprint 1 (weeks 1–2) — Core MVP

- Project setup (monorepo structure if needed)
- Auth (NextAuth)
- Prisma models + migrations
- Accounts CRUD + basic dashboard
- Transaction create & list

Sprint 2 (weeks 3–4) — UX + import/export

- CSV import/export
- Categories & tags
- Transaction filtering & search
- Basic monthly report UI

Sprint 3 (weeks 5–6) — Polish & reliability

- Recurring transactions
- Budgets UI + alerts
- Tests & linting
- Sentry + logging

Sprint 4 (weeks 7–8) — Integrations & performance

- Bank aggregation (if desired) or mocked connector
- Receipts upload
- Deployment pipeline + backups
- Final polish + accessibility checks

# 12 — Implementation notes & tips

- Start UI with component library (shadcn templates) to iterate fast.
- Keep transactions immutable where possible — edits create a new audit record or track `updatedAt`.
- Implement optimistic UI for fast UX but reconcile with server responses.
- For CSV import, provide a mapping UI and save mappings for repeat imports.
- Always include currency in transactions to avoid ambiguity.
- Consider soft deletes for safety (`deletedAt`).

---

If you want, I can:

- generate a more detailed Prisma schema with relations + indices,
- scaffold a folder structure (pages/app, components, lib/prisma, hooks),
- or produce example API handlers and a transaction form component in TypeScript + shadcn.

Which of those should I produce next?

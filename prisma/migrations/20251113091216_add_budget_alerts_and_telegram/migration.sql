-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('WARNING', 'EXCEEDED');

-- CreateEnum
CREATE TYPE "public"."AlertChannel" AS ENUM ('EMAIL', 'TELEGRAM', 'BOTH');

-- AlterTable
ALTER TABLE "public"."Budget" ADD COLUMN     "alertThreshold" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAlertSent" TIMESTAMP(3),
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "public"."UserPreference" ADD COLUMN     "budgetAlertThreshold" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramNotifications" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."BudgetAlert" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "alertType" "public"."AlertType" NOT NULL,
    "channel" "public"."AlertChannel" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetAlert_budgetId_sentAt_idx" ON "public"."BudgetAlert"("budgetId", "sentAt");

-- CreateIndex
CREATE INDEX "Budget_userId_month_year_idx" ON "public"."Budget"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "public"."BudgetAlert" ADD CONSTRAINT "BudgetAlert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "public"."Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

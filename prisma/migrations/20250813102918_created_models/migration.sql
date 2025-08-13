-- CreateEnum
CREATE TYPE "public"."AccountTypeEnum" AS ENUM ('SAVING', 'CURRENT', 'SALARY');

-- CreateEnum
CREATE TYPE "public"."AccountStatusEnum" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."CurrencyEnum" AS ENUM ('INR');

-- CreateEnum
CREATE TYPE "public"."CategoryEnum" AS ENUM ('FOOD', 'BILLS', 'HOTEL', 'RENT', 'HOSPITAL');

-- CreateEnum
CREATE TYPE "public"."TransacionTypeEnum" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENTS');

-- CreateEnum
CREATE TYPE "public"."TransactionStatusEnum" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethodEnum" AS ENUM ('UPI', 'CASH', 'CARD', 'ONLINE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bankAccount" (
    "bankID" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT,
    "iFSC_Code" TEXT,
    "branch" TEXT,
    "openingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "accountType" "public"."AccountTypeEnum" NOT NULL,
    "statuses" "public"."AccountStatusEnum" NOT NULL,
    "currency" "public"."CurrencyEnum" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bankAccount_pkey" PRIMARY KEY ("bankID")
);

-- CreateTable
CREATE TABLE "public"."bankAccountBalance" (
    "balanceID" SERIAL NOT NULL,
    "bankID" INTEGER NOT NULL,
    "totalDeposits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalWithdrawals" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "comments" TEXT,
    "Statuses" "public"."TransactionStatusEnum" NOT NULL DEFAULT 'COMPLETED',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bankAccountBalance_pkey" PRIMARY KEY ("balanceID")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "categoryID" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryType" "public"."CategoryEnum" NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("categoryID")
);

-- CreateTable
CREATE TABLE "public"."subCategory" (
    "subCategoryID" SERIAL NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "categoryID" INTEGER NOT NULL,

    CONSTRAINT "subCategory_pkey" PRIMARY KEY ("subCategoryID")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "transID" SERIAL NOT NULL,
    "bankAccountID" INTEGER NOT NULL,
    "transactionType" "public"."TransacionTypeEnum" NOT NULL,
    "categoryID" INTEGER NOT NULL,
    "subCategoryID" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethod" "public"."PaymentMethodEnum" NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "statuses" "public"."TransactionStatusEnum" NOT NULL DEFAULT 'COMPLETED',
    "userId" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "public"."users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "bankAccount_accountNumber_key" ON "public"."bankAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "bankAccount_userId_idx" ON "public"."bankAccount"("userId");

-- CreateIndex
CREATE INDEX "bankAccountBalance_userId_idx" ON "public"."bankAccountBalance"("userId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "public"."transactions"("userId");

-- AddForeignKey
ALTER TABLE "public"."bankAccount" ADD CONSTRAINT "bankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bankAccountBalance" ADD CONSTRAINT "bankAccountBalance_bankID_fkey" FOREIGN KEY ("bankID") REFERENCES "public"."bankAccount"("bankID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bankAccountBalance" ADD CONSTRAINT "bankAccountBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subCategory" ADD CONSTRAINT "subCategory_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "public"."categories"("categoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_bankAccountID_fkey" FOREIGN KEY ("bankAccountID") REFERENCES "public"."bankAccount"("bankID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "public"."categories"("categoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_subCategoryID_fkey" FOREIGN KEY ("subCategoryID") REFERENCES "public"."subCategory"("subCategoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

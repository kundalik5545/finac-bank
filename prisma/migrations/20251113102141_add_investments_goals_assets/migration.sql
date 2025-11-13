-- CreateEnum
CREATE TYPE "public"."InvestmentType" AS ENUM ('STOCKS', 'BONDS', 'FIXED_DEPOSIT', 'NPS', 'PF', 'GOLD', 'MUTUAL_FUNDS', 'CRYPTO', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('PROPERTY', 'VEHICLE', 'JEWELRY', 'ELECTRONICS', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Investment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."InvestmentType" NOT NULL,
    "symbol" TEXT,
    "quantity" DECIMAL(65,4) NOT NULL,
    "purchasePrice" DECIMAL(65,4) NOT NULL,
    "currentPrice" DECIMAL(65,4),
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(65,4) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AssetType" NOT NULL,
    "currentValue" DECIMAL(65,4) NOT NULL,
    "purchaseValue" DECIMAL(65,4) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Investment_userId_type_idx" ON "public"."Investment"("userId", "type");

-- CreateIndex
CREATE INDEX "Investment_userId_categoryId_idx" ON "public"."Investment"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "Goal_userId_isActive_idx" ON "public"."Goal"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Asset_userId_type_idx" ON "public"."Asset"("userId", "type");

-- AddForeignKey
ALTER TABLE "public"."Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Investment" ADD CONSTRAINT "Investment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Investment" ADD CONSTRAINT "Investment_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

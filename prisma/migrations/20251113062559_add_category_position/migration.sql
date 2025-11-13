-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "position" INTEGER;

-- CreateIndex
CREATE INDEX "Category_userId_position_idx" ON "public"."Category"("userId", "position");

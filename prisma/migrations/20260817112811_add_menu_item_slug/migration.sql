-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_siteId_slug_key" ON "MenuItem"("siteId", "slug");


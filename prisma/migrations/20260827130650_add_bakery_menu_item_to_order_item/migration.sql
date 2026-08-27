
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "bakeryItemId" TEXT,
ADD COLUMN     "menuItemId" TEXT;

-- CreateIndex
CREATE INDEX "OrderItem_bakeryItemId_idx" ON "OrderItem"("bakeryItemId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bakeryItemId_fkey" FOREIGN KEY ("bakeryItemId") REFERENCES "BakeryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


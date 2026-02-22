/*
  Warnings:

  - Added the required column `price` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "price" DECIMAL(12,2) NOT NULL;

-- CreateIndex
CREATE INDEX "PurchaseTransaction_userId_createdAt_idx" ON "PurchaseTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PurchaseTransaction_courseId_createdAt_idx" ON "PurchaseTransaction"("courseId", "createdAt");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseTransaction" ADD CONSTRAINT "PurchaseTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseTransaction" ADD CONSTRAINT "PurchaseTransaction_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

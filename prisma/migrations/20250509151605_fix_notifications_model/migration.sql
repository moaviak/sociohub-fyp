/*
  Warnings:

  - You are about to drop the column `recipientId` on the `NotificationRecipient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notificationId,studentId,advisorId]` on the table `NotificationRecipient` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_advisorId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_studentId_fkey";

-- DropIndex
DROP INDEX "NotificationRecipient_notificationId_recipientType_recipien_key";

-- DropIndex
DROP INDEX "NotificationRecipient_recipientType_recipientId_idx";

-- AlterTable
ALTER TABLE "NotificationRecipient" DROP COLUMN "recipientId",
ADD COLUMN     "advisorId" TEXT,
ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE INDEX "NotificationRecipient_recipientType_idx" ON "NotificationRecipient"("recipientType");

-- CreateIndex
CREATE INDEX "NotificationRecipient_studentId_idx" ON "NotificationRecipient"("studentId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_advisorId_idx" ON "NotificationRecipient"("advisorId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_studentId_advisorId_key" ON "NotificationRecipient"("notificationId", "studentId", "advisorId");

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `redirectUrl` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "redirectUrl";

-- AlterTable
ALTER TABLE "NotificationRecipient" ADD COLUMN     "redirectUrl" TEXT;

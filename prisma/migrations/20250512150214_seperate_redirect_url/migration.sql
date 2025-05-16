/*
  Warnings:

  - You are about to drop the column `redirectUrl` on the `NotificationRecipient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationRecipient" DROP COLUMN "redirectUrl",
ADD COLUMN     "mobileRedirectUrl" TEXT,
ADD COLUMN     "webRedirectUrl" TEXT;

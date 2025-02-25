/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `Advisor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Advisor" DROP COLUMN "emailVerificationToken",
ADD COLUMN     "emailVerificationCode" TEXT;

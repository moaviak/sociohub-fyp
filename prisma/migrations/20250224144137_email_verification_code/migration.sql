/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "emailVerificationToken",
ADD COLUMN     "emailVerificationCode" TEXT;

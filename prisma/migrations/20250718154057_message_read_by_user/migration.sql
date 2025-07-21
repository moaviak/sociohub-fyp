/*
  Warnings:

  - You are about to drop the column `userId` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Student_userId_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "userId";

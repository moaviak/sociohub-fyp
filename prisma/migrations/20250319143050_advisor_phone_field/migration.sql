/*
  Warnings:

  - You are about to drop the column `phone` on the `Advisor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Advisor_phone_key";

-- AlterTable
ALTER TABLE "Advisor" DROP COLUMN "phone";

/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Advisor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Advisor" ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_phone_key" ON "Advisor"("phone");

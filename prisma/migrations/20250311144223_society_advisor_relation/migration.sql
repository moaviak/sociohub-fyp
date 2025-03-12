/*
  Warnings:

  - A unique constraint covering the columns `[societyId]` on the table `Advisor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Advisor" ADD COLUMN     "societyId" TEXT;

-- CreateTable
CREATE TABLE "Society" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Society_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_societyId_key" ON "Advisor"("societyId");

-- CreateIndex
CREATE INDEX "Advisor_societyId_idx" ON "Advisor"("societyId");

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

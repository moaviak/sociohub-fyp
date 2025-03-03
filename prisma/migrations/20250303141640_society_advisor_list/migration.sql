/*
  Warnings:

  - Added the required column `displayName` to the `Advisor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advisor" ADD COLUMN     "displayName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SocietyAdvisor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "society" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocietyAdvisor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocietyAdvisor_email_key" ON "SocietyAdvisor"("email");

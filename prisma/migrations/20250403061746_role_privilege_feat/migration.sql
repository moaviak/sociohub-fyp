/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Privilege` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Privilege` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Privilege" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_key_key" ON "Privilege"("key");

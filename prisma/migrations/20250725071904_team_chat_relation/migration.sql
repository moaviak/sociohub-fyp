/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "chatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_chatId_key" ON "Team"("chatId");

-- CreateIndex
CREATE INDEX "Team_chatId_idx" ON "Team"("chatId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `chatId` on the `Team` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_chatId_fkey";

-- DropIndex
DROP INDEX "Team_chatId_idx";

-- DropIndex
DROP INDEX "Team_chatId_key";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "chatId";

-- CreateIndex
CREATE INDEX "Chat_teamId_idx" ON "Chat"("teamId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

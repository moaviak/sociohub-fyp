/*
  Warnings:

  - A unique constraint covering the columns `[teamId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_teamId_key" ON "Chat"("teamId");

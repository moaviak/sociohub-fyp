/*
  Warnings:

  - A unique constraint covering the columns `[studentId,deviceId,token]` on the table `push_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[advisorId,deviceId,token]` on the table `push_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "push_tokens_studentId_deviceId_idx" ON "push_tokens"("studentId", "deviceId");

-- CreateIndex
CREATE INDEX "push_tokens_advisorId_deviceId_idx" ON "push_tokens"("advisorId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_studentId_deviceId_token_key" ON "push_tokens"("studentId", "deviceId", "token");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_advisorId_deviceId_token_key" ON "push_tokens"("advisorId", "deviceId", "token");

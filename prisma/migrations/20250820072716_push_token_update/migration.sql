-- DropForeignKey
ALTER TABLE "push_tokens" DROP CONSTRAINT "push_tokens_advisorId_fkey";

-- DropForeignKey
ALTER TABLE "push_tokens" DROP CONSTRAINT "push_tokens_studentId_fkey";

-- DropIndex
DROP INDEX "push_tokens_deviceId_key";

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

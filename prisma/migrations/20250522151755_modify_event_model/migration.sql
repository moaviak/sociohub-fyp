-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Event_societyId_idx" ON "Event"("societyId");

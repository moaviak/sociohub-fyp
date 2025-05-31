/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Announcement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_eventId_key" ON "Announcement"("eventId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

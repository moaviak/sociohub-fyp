/*
  Warnings:

  - Added the required column `status` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('Publish', 'Schedule');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "status" "AnnouncementStatus" NOT NULL;

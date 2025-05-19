/*
  Warnings:

  - Added the required column `status` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL;

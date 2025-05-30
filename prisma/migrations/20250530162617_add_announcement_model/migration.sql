-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('All', 'Members');

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishDateTime" TIMESTAMP(3),
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'All',
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

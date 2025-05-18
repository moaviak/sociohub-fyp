-- CreateEnum
CREATE TYPE "EventCategories" AS ENUM ('Workshop', 'Seminar', 'SocialGathering', 'Competition', 'CulturalEvent', 'SportsEvent', 'Meeting', 'Other');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Physical', 'Online');

-- CreateEnum
CREATE TYPE "EventAudience" AS ENUM ('Open', 'Members', 'Invite');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('Publish', 'Draft', 'Schedule');

-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('CreditCard', 'Easypaisa');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "categories" "EventCategories"[],
    "banner" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "eventType" "EventType" NOT NULL,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "platform" TEXT,
    "meetingLink" TEXT,
    "accessInstructions" TEXT,
    "audience" "EventAudience" NOT NULL,
    "visibility" "EventVisibility" NOT NULL,
    "publishDateTime" TIMESTAMP(3),
    "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "paidEvent" BOOLEAN NOT NULL DEFAULT false,
    "ticketPrice" INTEGER,
    "paymentMethods" "PaymentMethods"[],
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcement" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "formStep" INTEGER,
    "societyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

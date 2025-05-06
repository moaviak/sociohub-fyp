-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "acceptingNewMembers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "membersLimit" INTEGER NOT NULL DEFAULT 40;

-- CreateEnum
CREATE TYPE "TeamJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TeamTaskStatus" AS ENUM ('TO_DO', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "TeamVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
ALTER TYPE "AnnouncementAudience" ADD VALUE 'Teams';

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "targetTeamIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedByTeamId" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "visibility" "TeamVisibility" NOT NULL DEFAULT 'PUBLIC',
    "societyId" TEXT NOT NULL,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "TeamJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "respondedById" TEXT,
    "responseNote" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "TeamJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TeamTaskStatus" NOT NULL DEFAULT 'TO_DO',
    "teamId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedByAdvisorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "advisorId" TEXT,

    CONSTRAINT "TeamTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Team_societyId_idx" ON "Team"("societyId");

-- CreateIndex
CREATE INDEX "Team_leadId_idx" ON "Team"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_societyId_name_key" ON "Team"("societyId", "name");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_studentId_idx" ON "TeamMember"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_studentId_key" ON "TeamMember"("teamId", "studentId");

-- CreateIndex
CREATE INDEX "TeamJoinRequest_teamId_idx" ON "TeamJoinRequest"("teamId");

-- CreateIndex
CREATE INDEX "TeamJoinRequest_studentId_idx" ON "TeamJoinRequest"("studentId");

-- CreateIndex
CREATE INDEX "TeamJoinRequest_status_idx" ON "TeamJoinRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamJoinRequest_teamId_studentId_key" ON "TeamJoinRequest"("teamId", "studentId");

-- CreateIndex
CREATE INDEX "TeamInvitation_teamId_idx" ON "TeamInvitation"("teamId");

-- CreateIndex
CREATE INDEX "TeamInvitation_studentId_idx" ON "TeamInvitation"("studentId");

-- CreateIndex
CREATE INDEX "TeamInvitation_status_idx" ON "TeamInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_teamId_studentId_key" ON "TeamInvitation"("teamId", "studentId");

-- CreateIndex
CREATE INDEX "TeamTask_teamId_idx" ON "TeamTask"("teamId");

-- CreateIndex
CREATE INDEX "TeamTask_assignedById_idx" ON "TeamTask"("assignedById");

-- CreateIndex
CREATE INDEX "TeamTask_assignedByAdvisorId_idx" ON "TeamTask"("assignedByAdvisorId");

-- CreateIndex
CREATE INDEX "TeamTask_status_idx" ON "TeamTask"("status");

-- CreateIndex
CREATE INDEX "Task_assignedByTeamId_idx" ON "Task"("assignedByTeamId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedByTeamId_fkey" FOREIGN KEY ("assignedByTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

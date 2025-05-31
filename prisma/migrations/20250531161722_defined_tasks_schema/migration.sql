-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByStudentId" TEXT,
    "createdByAdvisorId" TEXT,
    "assignedBySocietyId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_createdByStudentId_idx" ON "Task"("createdByStudentId");

-- CreateIndex
CREATE INDEX "Task_createdByAdvisorId_idx" ON "Task"("createdByAdvisorId");

-- CreateIndex
CREATE INDEX "Task_assignedBySocietyId_idx" ON "Task"("assignedBySocietyId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByStudentId_fkey" FOREIGN KEY ("createdByStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByAdvisorId_fkey" FOREIGN KEY ("createdByAdvisorId") REFERENCES "Advisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedBySocietyId_fkey" FOREIGN KEY ("assignedBySocietyId") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

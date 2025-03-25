/*
  Warnings:

  - The primary key for the `JoinRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `JoinRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("studentId", "societyId");

-- CreateTable
CREATE TABLE "StudentSociety" (
    "studentId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSociety_pkey" PRIMARY KEY ("studentId","societyId")
);

-- AddForeignKey
ALTER TABLE "StudentSociety" ADD CONSTRAINT "StudentSociety_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSociety" ADD CONSTRAINT "StudentSociety_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `semester` to the `JoinRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNo` to the `JoinRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN     "interestedRoleId" TEXT,
ADD COLUMN     "semester" INTEGER NOT NULL,
ADD COLUMN     "whatsappNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "minSemester" INTEGER;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_interestedRoleId_fkey" FOREIGN KEY ("interestedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

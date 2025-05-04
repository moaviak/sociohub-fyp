-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN     "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING';

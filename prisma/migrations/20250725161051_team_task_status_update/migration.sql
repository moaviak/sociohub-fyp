/*
  Warnings:

  - The values [UNDER_REVIEW] on the enum `TeamTaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TeamTaskStatus_new" AS ENUM ('TO_DO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "TeamTask" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TeamTask" ALTER COLUMN "status" TYPE "TeamTaskStatus_new" USING ("status"::text::"TeamTaskStatus_new");
ALTER TYPE "TeamTaskStatus" RENAME TO "TeamTaskStatus_old";
ALTER TYPE "TeamTaskStatus_new" RENAME TO "TeamTaskStatus";
DROP TYPE "TeamTaskStatus_old";
ALTER TABLE "TeamTask" ALTER COLUMN "status" SET DEFAULT 'TO_DO';
COMMIT;

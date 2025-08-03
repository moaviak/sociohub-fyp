/*
  Warnings:

  - The values [SUSPICIOUS] on the enum `ActionNature` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionNature_new" AS ENUM ('CONSTRUCTIVE', 'NEUTRAL', 'DESTRUCTIVE', 'ADMINISTRATIVE');
ALTER TABLE "ActivityLog" ALTER COLUMN "nature" TYPE "ActionNature_new" USING ("nature"::text::"ActionNature_new");
ALTER TYPE "ActionNature" RENAME TO "ActionNature_old";
ALTER TYPE "ActionNature_new" RENAME TO "ActionNature";
DROP TYPE "ActionNature_old";
COMMIT;

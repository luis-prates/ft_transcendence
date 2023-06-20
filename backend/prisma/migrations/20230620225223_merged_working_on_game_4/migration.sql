/*
  Warnings:

  - The values [STARTED,ENDED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGESS', 'FINISHED');
ALTER TABLE "games" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "games" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

/*
  Warnings:

  - Added the required column `gameType` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "gameType" "GameType" NOT NULL;

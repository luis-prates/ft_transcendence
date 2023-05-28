/*
  Warnings:

  - You are about to drop the column `testJson` on the `games` table. All the data in the column will be lost.
  - Added the required column `gameStats` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "testJson",
ADD COLUMN     "gameStats" JSONB NOT NULL;

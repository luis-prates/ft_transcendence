/*
  Warnings:

  - Added the required column `color` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "money" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paddleSkinEquipped" TEXT,
ADD COLUMN     "paddleSkinsOwned" TEXT[],
ADD COLUMN     "tableColorEquipped" TEXT,
ADD COLUMN     "tableSkinEquipped" TEXT,
ADD COLUMN     "tableSkinsOwned" TEXT[],
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

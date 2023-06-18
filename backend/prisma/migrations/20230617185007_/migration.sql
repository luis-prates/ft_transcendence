/*
  Warnings:

  - Made the column `color` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paddleSkinEquipped` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tableColorEquipped` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tableSkinEquipped` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'blue',
ALTER COLUMN "paddleSkinEquipped" SET NOT NULL,
ALTER COLUMN "paddleSkinEquipped" SET DEFAULT '',
ALTER COLUMN "tableColorEquipped" SET NOT NULL,
ALTER COLUMN "tableColorEquipped" SET DEFAULT '',
ALTER COLUMN "tableSkinEquipped" SET NOT NULL,
ALTER COLUMN "tableSkinEquipped" SET DEFAULT '';

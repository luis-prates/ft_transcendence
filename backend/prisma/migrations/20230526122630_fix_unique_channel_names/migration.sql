/*
  Warnings:

  - Made the column `name` on table `Channel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "name" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the column `password` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "password",
ADD COLUMN     "hash" TEXT;

/*
  Warnings:

  - The primary key for the `friends` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "friends" DROP CONSTRAINT "friends_pkey",
ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("id");

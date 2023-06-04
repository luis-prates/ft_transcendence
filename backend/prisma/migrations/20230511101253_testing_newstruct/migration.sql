/*
  Warnings:

  - The primary key for the `friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `friendId` on the `friends` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_friendId_fkey";

-- DropIndex
DROP INDEX "friend_index";

-- AlterTable
ALTER TABLE "friends" DROP CONSTRAINT "friends_pkey",
DROP COLUMN "friendId",
ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("userId");

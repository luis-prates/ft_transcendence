/*
  Warnings:

  - The primary key for the `friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `friendships` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "friends" DROP CONSTRAINT "friends_pkey",
ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("userId", "friendId");

-- AlterTable
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_pkey",
ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("requestorId", "requesteeId");

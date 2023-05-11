/*
  Warnings:

  - Added the required column `requesteeName` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestorName` to the `friendships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requesteeId_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requestorId_fkey";

-- AlterTable
ALTER TABLE "friendships" ADD COLUMN     "requesteeName" TEXT NOT NULL,
ADD COLUMN     "requestorName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requestorId_requestorName_fkey" FOREIGN KEY ("requestorId", "requestorName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesteeId_requesteeName_fkey" FOREIGN KEY ("requesteeId", "requesteeName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

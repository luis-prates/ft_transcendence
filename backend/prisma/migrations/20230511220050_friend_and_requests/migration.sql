/*
  Warnings:

  - You are about to drop the `friendships` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "FriendReqStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requesteeId_requesteeName_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requestorId_requestorName_fkey";

-- DropTable
DROP TABLE "friendships";

-- CreateTable
CREATE TABLE "friend_requests" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestorId" INTEGER NOT NULL,
    "requestorName" TEXT NOT NULL,
    "requesteeId" INTEGER NOT NULL,
    "requesteeName" TEXT NOT NULL,
    "status" "FriendReqStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("requestorId","requesteeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_requests_id_key" ON "friend_requests"("id");

-- CreateIndex
CREATE INDEX "friendship_index" ON "friend_requests"("requestorId", "requesteeId");

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requestorId_requestorName_fkey" FOREIGN KEY ("requestorId", "requestorName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requesteeId_requesteeName_fkey" FOREIGN KEY ("requesteeId", "requesteeName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

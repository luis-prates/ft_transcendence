/*
  Warnings:

  - A unique constraint covering the columns `[id,nickname]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friendName` to the `friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_friendId_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_userId_fkey";

-- AlterTable
ALTER TABLE "friends" ADD COLUMN     "friendName" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_id_nickname_key" ON "users"("id", "nickname");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_userName_fkey" FOREIGN KEY ("userId", "userName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friendId_friendName_fkey" FOREIGN KEY ("friendId", "friendName") REFERENCES "users"("id", "nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

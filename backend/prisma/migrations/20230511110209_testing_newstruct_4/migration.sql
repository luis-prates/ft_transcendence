/*
  Warnings:

  - The primary key for the `friends` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "friends" DROP CONSTRAINT "friends_pkey",
ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("userId", "friendId");

-- CreateIndex
CREATE INDEX "friend_index" ON "friends"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

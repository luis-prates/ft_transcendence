-- DropForeignKey
ALTER TABLE "friend_requests" DROP CONSTRAINT "friend_requests_requesteeId_requesteeName_fkey";

-- DropForeignKey
ALTER TABLE "friend_requests" DROP CONSTRAINT "friend_requests_requestorId_requestorName_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_friendId_friendName_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_userId_userName_fkey";

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requestorId_requestorName_fkey" FOREIGN KEY ("requestorId", "requestorName") REFERENCES "users"("id", "nickname") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requesteeId_requesteeName_fkey" FOREIGN KEY ("requesteeId", "requesteeName") REFERENCES "users"("id", "nickname") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_userName_fkey" FOREIGN KEY ("userId", "userName") REFERENCES "users"("id", "nickname") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friendId_friendName_fkey" FOREIGN KEY ("friendId", "friendName") REFERENCES "users"("id", "nickname") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `Customization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `games` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_A_fkey";

-- AlterTable
ALTER TABLE "Customization" DROP CONSTRAINT "Customization_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "Customization_id_seq";

-- AlterTable
ALTER TABLE "_GameToUser" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "friend_requests" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "friend_requests_id_seq";

-- AlterTable
ALTER TABLE "friends" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "friends_id_seq";

-- AlterTable
ALTER TABLE "games" DROP CONSTRAINT "games_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "games_id_seq";

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

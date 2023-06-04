/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `type` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PRIVATE', 'PUBLIC', 'PROTECTED', 'DM');

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "isPrivate",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "ChannelType" NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

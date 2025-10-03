/*
  Warnings:

  - You are about to drop the column `isOnline` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isOnline",
DROP COLUMN "lastSeen",
ADD COLUMN     "is_online" BOOLEAN,
ADD COLUMN     "last_seen" TIMESTAMP(3);

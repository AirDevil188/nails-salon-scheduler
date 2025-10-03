/*
  Warnings:

  - Added the required column `isOnline` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastSeen` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "isOnline" BOOLEAN NOT NULL,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL;

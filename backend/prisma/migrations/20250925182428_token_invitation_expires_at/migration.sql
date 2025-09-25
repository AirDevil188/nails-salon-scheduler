/*
  Warnings:

  - Added the required column `expiresAt` to the `invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."invitation" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."token" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

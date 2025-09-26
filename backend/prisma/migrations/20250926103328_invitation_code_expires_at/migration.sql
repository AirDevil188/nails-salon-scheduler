/*
  Warnings:

  - Added the required column `codeExpiresAt` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."invitation" ADD COLUMN     "codeExpiresAt" TIMESTAMP(3) NOT NULL;

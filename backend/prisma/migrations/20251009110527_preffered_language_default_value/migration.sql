/*
  Warnings:

  - The `preferredLanguage` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('sr', 'en');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "preferredLanguage",
ADD COLUMN     "preferredLanguage" "Language" NOT NULL DEFAULT 'sr';

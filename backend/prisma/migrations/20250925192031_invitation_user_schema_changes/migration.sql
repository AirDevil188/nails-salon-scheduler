/*
  Warnings:

  - You are about to drop the column `userId` on the `invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `invitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- DropForeignKey
ALTER TABLE "public"."invitation" DROP CONSTRAINT "invitation_userId_fkey";

-- DropIndex
DROP INDEX "public"."invitation_userId_key";

-- AlterTable
ALTER TABLE "public"."invitation" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invitationStatus" "public"."InvitationStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "invitationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invitation_email_key" ON "public"."invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitationId_key" ON "public"."user"("invitationId");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "public"."invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

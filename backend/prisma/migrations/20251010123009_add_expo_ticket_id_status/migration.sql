/*
  Warnings:

  - Added the required column `status` to the `notification_receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification_receipt" ADD COLUMN     "expoTicketId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;

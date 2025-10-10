/*
  Warnings:

  - A unique constraint covering the columns `[expoTicketId]` on the table `notification_receipt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "notification_receipt_expoTicketId_key" ON "notification_receipt"("expoTicketId");

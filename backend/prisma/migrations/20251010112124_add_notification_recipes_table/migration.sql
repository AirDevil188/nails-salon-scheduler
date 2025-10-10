-- CreateTable
CREATE TABLE "notification_receipt" (
    "id" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "userId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_receipt_pkey" PRIMARY KEY ("id")
);

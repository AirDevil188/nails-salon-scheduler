-- DropForeignKey
ALTER TABLE "public"."token" DROP CONSTRAINT "token_token_fkey";

-- CreateTable
CREATE TABLE "_TokenToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TokenToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TokenToUser_B_index" ON "_TokenToUser"("B");

-- AddForeignKey
ALTER TABLE "_TokenToUser" ADD CONSTRAINT "_TokenToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TokenToUser" ADD CONSTRAINT "_TokenToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

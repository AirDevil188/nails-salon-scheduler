-- AddForeignKey
ALTER TABLE "pushToken" ADD CONSTRAINT "pushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

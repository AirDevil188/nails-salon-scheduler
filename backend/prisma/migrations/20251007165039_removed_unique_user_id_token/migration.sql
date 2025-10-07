-- DropForeignKey
ALTER TABLE "public"."token" DROP CONSTRAINT "token_userId_fkey";

-- DropIndex
DROP INDEX "public"."token_userId_key";

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_token_fkey" FOREIGN KEY ("token") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

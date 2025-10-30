-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('primary', 'secondary', 'warning', 'critical');

-- AlterTable
ALTER TABLE "note" ADD COLUMN     "type" "NoteType" NOT NULL DEFAULT 'primary';

/*
  Warnings:

  - The values [pending,confirmed] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AppointmentStatus_new" AS ENUM ('scheduled', 'completed', 'canceled', 'no_show');
ALTER TABLE "public"."appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."appointment" ALTER COLUMN "status" TYPE "public"."AppointmentStatus_new" USING ("status"::text::"public"."AppointmentStatus_new");
ALTER TYPE "public"."AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "public"."AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "public"."appointment" ALTER COLUMN "status" SET DEFAULT 'scheduled';
COMMIT;

-- AlterTable
ALTER TABLE "public"."appointment" ALTER COLUMN "status" SET DEFAULT 'scheduled';

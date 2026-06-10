-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "brandSquareCorners" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "brandBackgroundType" TEXT,
ADD COLUMN "brandBackgroundColor2" TEXT,
ADD COLUMN "brandBackgroundGradientAngle" INTEGER;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "brandSquareCorners" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "brandBackgroundType" TEXT,
ADD COLUMN "brandBackgroundColor2" TEXT,
ADD COLUMN "brandBackgroundGradientAngle" INTEGER;

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN "brandSquareCorners" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "brandBackgroundType" TEXT,
ADD COLUMN "brandBackgroundColor2" TEXT,
ADD COLUMN "brandBackgroundGradientAngle" INTEGER;

-- AlterTable
ALTER TABLE "BrandingPreset" ADD COLUMN "brandSquareCorners" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "brandBackgroundType" TEXT,
ADD COLUMN "brandBackgroundColor2" TEXT,
ADD COLUMN "brandBackgroundGradientAngle" INTEGER;

-- CreateTable
CREATE TABLE "BrandingPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandLogoUrl" TEXT,
    "brandLogoSize" INTEGER,
    "brandLogoTransparentBg" BOOLEAN NOT NULL DEFAULT true,
    "brandLogoRounded" BOOLEAN NOT NULL DEFAULT false,
    "brandColor" TEXT,
    "brandTextColor" TEXT,
    "brandCardColor" TEXT,
    "brandIconBackgroundColor" TEXT,
    "brandBackgroundColor" TEXT,
    "brandBackgroundImageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandingPreset_userId_idx" ON "BrandingPreset"("userId");

-- AddForeignKey
ALTER TABLE "BrandingPreset" ADD CONSTRAINT "BrandingPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

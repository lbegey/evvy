-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legacyUnlimitedRsvps" BOOLEAN NOT NULL DEFAULT false;

-- Grandfather every account that existed before the Free plan's 40-RSVP
-- visibility cap: they keep unlimited RSVP access for life. New accounts get
-- the column default (false) and are capped unless they go Premium.
UPDATE "User" SET "legacyUnlimitedRsvps" = true;

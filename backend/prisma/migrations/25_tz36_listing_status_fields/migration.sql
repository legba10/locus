-- TZ-36: unified moderation fields for listings
ALTER TABLE "Listing"
ADD COLUMN IF NOT EXISTS "moderation_note" TEXT,
ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);

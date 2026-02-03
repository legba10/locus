-- Add viewsCount to Listing
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "viewsCount" INTEGER NOT NULL DEFAULT 0;

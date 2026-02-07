-- Add plan + listingLimit to User for tariff business logic

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserPlan') THEN
    CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'AGENCY');
  END IF;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "listingLimit" INTEGER NOT NULL DEFAULT 1;

-- Backfill listingLimit for existing rows based on plan
UPDATE "User"
SET "listingLimit" =
  CASE "plan"
    WHEN 'FREE' THEN 1
    WHEN 'PRO' THEN 5
    WHEN 'AGENCY' THEN 10
    ELSE 1
  END
WHERE "listingLimit" IS NULL OR "listingLimit" = 0;


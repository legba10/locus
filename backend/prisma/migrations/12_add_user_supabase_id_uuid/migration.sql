-- Add strict supabase uid mirror (uuid) to Neon User table

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "supabase_id" UUID;

-- Backfill from id (we keep User.id = Supabase user id)
UPDATE "User"
SET "supabase_id" = "id"::uuid
WHERE "supabase_id" IS NULL
  AND "id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Also backfill from legacy supabaseId if present
UPDATE "User"
SET "supabase_id" = "supabaseId"::uuid
WHERE "supabase_id" IS NULL
  AND "supabaseId" IS NOT NULL
  AND "supabaseId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Unique constraint/index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'User_supabase_id_key'
  ) THEN
    CREATE UNIQUE INDEX "User_supabase_id_key" ON "User"("supabase_id");
  END IF;
END $$;


-- Add session tokens storage for Telegram login reuse
ALTER TABLE "TelegramLoginToken"
ADD COLUMN IF NOT EXISTS "accessToken" TEXT,
ADD COLUMN IF NOT EXISTS "refreshToken" TEXT,
ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3);

-- Backfill usedAt for already used tokens (optional)
UPDATE "TelegramLoginToken"
SET "usedAt" = COALESCE("usedAt", NOW())
WHERE "used" = true AND "usedAt" IS NULL;

-- Notifications logic extension: text/link/entity/statuses/dedup indexes
ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "text" TEXT,
  ADD COLUMN IF NOT EXISTS "link" TEXT,
  ADD COLUMN IF NOT EXISTS "entityId" TEXT,
  ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isSeen" BOOLEAN NOT NULL DEFAULT false;

-- Backfill for existing rows
UPDATE "Notification"
SET "text" = COALESCE("text", "body"),
    "isRead" = COALESCE("isRead", "read"),
    "isSeen" = COALESCE("isSeen", "read")
WHERE true;

CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx"
  ON "Notification"("userId", "isRead");

CREATE INDEX IF NOT EXISTS "Notification_userId_isSeen_idx"
  ON "Notification"("userId", "isSeen");

CREATE INDEX IF NOT EXISTS "Notification_userId_type_entityId_createdAt_idx"
  ON "Notification"("userId", "type", "entityId", "createdAt");

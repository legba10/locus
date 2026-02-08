-- Add MANAGER to UserRoleEnum
DO $$ BEGIN
  ALTER TYPE "UserRoleEnum" ADD VALUE 'MANAGER';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Listing: moderation fields
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "moderationComment" TEXT,
  ADD COLUMN IF NOT EXISTS "moderatedById" TEXT;

ALTER TABLE "Listing"
  DROP CONSTRAINT IF EXISTS "Listing_moderatedById_fkey";

ALTER TABLE "Listing"
  ADD CONSTRAINT "Listing_moderatedById_fkey"
  FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Notifications table
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification"
  DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

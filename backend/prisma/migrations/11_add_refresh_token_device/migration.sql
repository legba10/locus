-- Add device identifier for multi-device sessions

ALTER TABLE "RefreshToken"
ADD COLUMN IF NOT EXISTS "device" TEXT;

-- Helpful index to query sessions per user/device
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_device_idx"
ON "RefreshToken" ("userId", "device");


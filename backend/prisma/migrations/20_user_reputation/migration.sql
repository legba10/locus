-- ТЗ-7: Репутация пользователя (host_score, guest_score, trust)
CREATE TABLE IF NOT EXISTS "UserReputation" (
  "userId" TEXT NOT NULL,
  "hostScore" DOUBLE PRECISION,
  "guestScore" DOUBLE PRECISION,
  "trustScore" DOUBLE PRECISION,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserReputation_pkey" PRIMARY KEY ("userId")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserReputation_userId_fkey') THEN
    ALTER TABLE "UserReputation"
      ADD CONSTRAINT "UserReputation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "UserReputation_userId_idx" ON "UserReputation"("userId");

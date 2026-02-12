-- ТЗ-2: Структурированные метрики отзывов и теги для AI
-- ReviewMetrics: одна строка на отзыв (cleanliness, location, noise, owner, value, checkin, safety)
-- ReviewTag: теги отзыва (review_id, tag)

CREATE TABLE IF NOT EXISTS "ReviewMetrics" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "cleanliness" INTEGER,
  "location" INTEGER,
  "noise" INTEGER,
  "owner" INTEGER,
  "value" INTEGER,
  "checkin" INTEGER,
  "safety" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewMetrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReviewMetrics_reviewId_key" ON "ReviewMetrics"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewMetrics_reviewId_idx" ON "ReviewMetrics"("reviewId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReviewMetrics_reviewId_fkey') THEN
    ALTER TABLE "ReviewMetrics"
      ADD CONSTRAINT "ReviewMetrics_reviewId_fkey"
      FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ReviewTag" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  CONSTRAINT "ReviewTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReviewTag_reviewId_tag_key" ON "ReviewTag"("reviewId","tag");
CREATE INDEX IF NOT EXISTS "ReviewTag_reviewId_idx" ON "ReviewTag"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewTag_tag_idx" ON "ReviewTag"("tag");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReviewTag_reviewId_fkey') THEN
    ALTER TABLE "ReviewTag"
      ADD CONSTRAINT "ReviewTag_reviewId_fkey"
      FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

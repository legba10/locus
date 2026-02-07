-- Reviews metrics + listing aggregates (cached)

-- 1) Enforce one review per (listingId, authorId)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Review_listingId_authorId_key'
  ) THEN
    -- This will fail if duplicates already exist; fix data before applying in prod.
    CREATE UNIQUE INDEX "Review_listingId_authorId_key" ON "Review"("listingId","authorId");
  END IF;
END $$;

-- 2) ReviewMetric
CREATE TABLE IF NOT EXISTS "ReviewMetric" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewMetric_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReviewMetric_reviewId_fkey') THEN
    ALTER TABLE "ReviewMetric"
      ADD CONSTRAINT "ReviewMetric_reviewId_fkey"
      FOREIGN KEY ("reviewId") REFERENCES "Review"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ReviewMetric_reviewId_metricKey_key"
  ON "ReviewMetric"("reviewId","metricKey");
CREATE INDEX IF NOT EXISTS "ReviewMetric_reviewId_idx" ON "ReviewMetric"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewMetric_metricKey_idx" ON "ReviewMetric"("metricKey");

-- 3) ListingMetricAgg
CREATE TABLE IF NOT EXISTS "ListingMetricAgg" (
  "listingId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "avgValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingMetricAgg_pkey" PRIMARY KEY ("listingId","metricKey")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ListingMetricAgg_listingId_fkey') THEN
    ALTER TABLE "ListingMetricAgg"
      ADD CONSTRAINT "ListingMetricAgg_listingId_fkey"
      FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ListingMetricAgg_listingId_idx" ON "ListingMetricAgg"("listingId");
CREATE INDEX IF NOT EXISTS "ListingMetricAgg_metricKey_idx" ON "ListingMetricAgg"("metricKey");


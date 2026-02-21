-- TZ-39: AI recommendations snapshot storage
CREATE TABLE IF NOT EXISTS "listing_ai_metrics" (
  "listing_id" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "conversion" INTEGER NOT NULL,
  "tips_json" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "listing_ai_metrics_pkey" PRIMARY KEY ("listing_id"),
  CONSTRAINT "listing_ai_metrics_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "listing_ai_metrics_updated_at_idx" ON "listing_ai_metrics"("updated_at");

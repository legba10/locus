-- TZ-38: listing analytics counters
CREATE TABLE IF NOT EXISTS "listing_stats" (
  "listing_id" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "favorites" INTEGER NOT NULL DEFAULT 0,
  "messages" INTEGER NOT NULL DEFAULT 0,
  "bookings" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "listing_stats_pkey" PRIMARY KEY ("listing_id"),
  CONSTRAINT "listing_stats_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "listing_stats_updated_at_idx" ON "listing_stats"("updated_at");

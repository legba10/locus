-- CreateTable
CREATE TABLE "ListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingView_listingId_sessionId_key" ON "ListingView"("listingId", "sessionId");
CREATE INDEX "ListingView_listingId_idx" ON "ListingView"("listingId");
CREATE INDEX "ListingView_sessionId_idx" ON "ListingView"("sessionId");

-- AddForeignKey
ALTER TABLE "ListingView"
ADD CONSTRAINT "ListingView_listingId_fkey"
FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

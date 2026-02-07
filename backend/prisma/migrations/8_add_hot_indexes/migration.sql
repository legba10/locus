-- Hot path indexes for 1k-10k concurrency
-- NOTE: Uses IF NOT EXISTS for idempotency.

-- TelegramAuthSession
CREATE INDEX IF NOT EXISTS "TelegramAuthSession_telegramUserId_idx"
  ON "TelegramAuthSession"("telegramUserId");
CREATE INDEX IF NOT EXISTS "TelegramAuthSession_phoneNumber_idx"
  ON "TelegramAuthSession"("phoneNumber");
CREATE INDEX IF NOT EXISTS "TelegramAuthSession_status_idx"
  ON "TelegramAuthSession"("status");
CREATE INDEX IF NOT EXISTS "TelegramAuthSession_createdAt_idx"
  ON "TelegramAuthSession"("createdAt");
CREATE INDEX IF NOT EXISTS "TelegramAuthSession_status_createdAt_idx"
  ON "TelegramAuthSession"("status","createdAt");

-- TelegramLoginToken
CREATE INDEX IF NOT EXISTS "TelegramLoginToken_userId_idx"
  ON "TelegramLoginToken"("userId");
CREATE INDEX IF NOT EXISTS "TelegramLoginToken_used_idx"
  ON "TelegramLoginToken"("used");
CREATE INDEX IF NOT EXISTS "TelegramLoginToken_userId_expiresAt_idx"
  ON "TelegramLoginToken"("userId","expiresAt");
CREATE INDEX IF NOT EXISTS "TelegramLoginToken_used_expiresAt_idx"
  ON "TelegramLoginToken"("used","expiresAt");

-- Listing
CREATE INDEX IF NOT EXISTS "Listing_ownerId_idx" ON "Listing"("ownerId");
CREATE INDEX IF NOT EXISTS "Listing_status_idx" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "Listing_createdAt_idx" ON "Listing"("createdAt");
CREATE INDEX IF NOT EXISTS "Listing_city_idx" ON "Listing"("city");
CREATE INDEX IF NOT EXISTS "Listing_status_createdAt_idx" ON "Listing"("status","createdAt");
CREATE INDEX IF NOT EXISTS "Listing_city_status_createdAt_idx" ON "Listing"("city","status","createdAt");
CREATE INDEX IF NOT EXISTS "Listing_ownerId_status_createdAt_idx" ON "Listing"("ownerId","status","createdAt");
CREATE INDEX IF NOT EXISTS "Listing_status_basePrice_idx" ON "Listing"("status","basePrice");
CREATE INDEX IF NOT EXISTS "Listing_status_capacityGuests_idx" ON "Listing"("status","capacityGuests");
CREATE INDEX IF NOT EXISTS "Listing_status_type_idx" ON "Listing"("status","type");

-- Booking
CREATE INDEX IF NOT EXISTS "Booking_guestId_idx" ON "Booking"("guestId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");
CREATE INDEX IF NOT EXISTS "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE INDEX IF NOT EXISTS "Booking_guestId_createdAt_idx" ON "Booking"("guestId","createdAt");
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx" ON "Booking"("status","createdAt");
CREATE INDEX IF NOT EXISTS "Booking_hostId_status_idx" ON "Booking"("hostId","status");

-- Review
CREATE INDEX IF NOT EXISTS "Review_authorId_idx" ON "Review"("authorId");
CREATE INDEX IF NOT EXISTS "Review_authorId_createdAt_idx" ON "Review"("authorId","createdAt");

-- AiEvent
CREATE INDEX IF NOT EXISTS "AiEvent_userId_idx" ON "AiEvent"("userId");
CREATE INDEX IF NOT EXISTS "AiEvent_listingId_idx" ON "AiEvent"("listingId");
CREATE INDEX IF NOT EXISTS "AiEvent_type_idx" ON "AiEvent"("type");
CREATE INDEX IF NOT EXISTS "AiEvent_createdAt_idx" ON "AiEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AiEvent_userId_createdAt_idx" ON "AiEvent"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "AiEvent_listingId_createdAt_idx" ON "AiEvent"("listingId","createdAt");
CREATE INDEX IF NOT EXISTS "AiEvent_type_createdAt_idx" ON "AiEvent"("type","createdAt");

-- Favorite
CREATE INDEX IF NOT EXISTS "Favorite_userId_createdAt_idx" ON "Favorite"("userId","createdAt");


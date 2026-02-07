## Plan: Reviews + Metrics + AI Summary (10k-ready)

Goal: Build a production-grade reviews system with metric sliders, cached aggregates, and AI-style summary; scalable to 10k online.

### DB (Prisma/Postgres)
- [ ] Extend `Review`:
  - enforce **one review per (listingId, authorId)** at DB level
- [ ] Add `ReviewMetric`:
  - (reviewId, metricKey) unique
  - indexes: reviewId, metricKey
- [ ] Add `ListingMetricAgg`:
  - PK: (listingId, metricKey)
  - fields: avgValue, count, updatedAt
  - indexes: listingId, metricKey
- [ ] Migration + `prisma generate`

### Backend (NestJS)
- [ ] `POST /api/reviews`
  - create review + metrics in transaction
  - atomically upsert aggregates (INSERT..ON CONFLICT update avg/count)
  - protect: auth + rate-limit + unique constraint mapping → 409
- [ ] `GET /api/reviews/listing/:listingId`
  - list last N reviews
- [ ] `GET /api/reviews/listing/:listingId/metrics`
  - return aggregates from `ListingMetricAgg` (no recompute)

### Frontend (Next.js)
- [ ] `metricsPool.ts`: curated metrics keys + labels; pick random 6 for form
- [ ] Review form:
  - rating 1..5, text, 6 sliders 0..100
  - submit → POST /api/reviews; handle conflicts
- [ ] Listing page:
  - display metric averages (from aggregates)
  - show recent reviews + form

### AI layer
- [ ] `POST /api/ai/review-summary`
  - input: metrics + texts
  - output: summary
  - deterministic fallback (no external LLM dependency)

### Non-functional
- [ ] Ensure builds pass
- [ ] Commit + push


## LOCUS New Platform — Architecture (MVP)

### Goals

- A clean **Next.js App Router** frontend with **Admin Control Center**, **Host Dashboard**, and guest flows.
- A minimal **mock backend** that behaves like real endpoints to enable frontend integration early.
- **AI-ready hooks** for ranking, recommendations, risk signals, analytics.
- Strong navigation semantics:
  - **Cards use `Link` as the root clickable element**
  - Programmatic navigation uses `router.push`
  - No global click interceptors

### Folder structure (key)

```
locus-new/
  frontend/
    app/                      # Next.js routes (App Router)
      __router_test__/         # Debug route for router.push vs anchors
      search/
      listings/[id]/
      host/dashboard/
      admin/
      auth/login/
      auth/register/
      api/                     # Mock backend API routes (Route Handlers)
        listings/
        host/
        admin/
        search/
        bookings/
    domains/                   # Domain-driven modules (typed contracts)
      user/
      listing/
      booking/
      search/
      host/
      admin/
    shared/
      ui/                      # UI primitives (Button, Card, LinkCard, Modal…)
      hooks/                   # React hooks (useFetch via React Query)
      utils/                   # api client, mock db, AI stub hooks
    styles/
      globals.css
  docs/
    architecture.md
```

### Mock backend & DB

- API routes live under `frontend/app/api/*` and return JSON.
- Persistence is file-based for dev:
  - env: `LOCUS_MOCK_DB_FILE` (default `.locus-mock-db.json`)
  - implemented in `frontend/shared/utils/mock-db.ts`

### API contracts (current)

- **Listings**
  - `GET /api/listings?city&from&to&guests&limit`
    - returns `{ items: Listing[] }`
  - `GET /api/listings/:id`
    - returns `{ item: ListingDetail }`
- **Host**
  - `GET /api/host/overview?hostId`
  - `GET /api/host/listing-stats?hostId`
  - `GET /api/host/recommendations?hostId`
  - `GET /api/host/risk-signals?hostId`
- **Admin**
  - `GET /api/admin/overview`
  - `GET /api/admin/moderation-queue`
  - `GET /api/admin/signals`
  - `GET /api/admin/recommendations`
- **Search**
  - `GET /api/search/cities?q`
- **Bookings**
  - `GET /api/bookings`
  - `POST /api/bookings` (creates a mock booking)

### AI extension points (where to plug in)

All AI-facing stubs are centralized in `frontend/shared/utils/ai.ts`:

- **Ranking**: `rankListings(listings, query)`
- **Host recommendations**: `getHostAiRecommendations(hostId)`
- **Host risk signals**: `getHostRiskSignals(hostId)`
- **Admin signals**: `getAdminSignals()`
- **Admin AI actions**: `getAdminAiRecommendations()`

Replace these with real model endpoints later:

1. Create a real service (or route handlers) like `/api/ai/recommendations`.
2. Update the stub implementations to call `fetch('/api/ai/...')`.
3. Keep the return types stable to avoid UI churn.

### Navigation correctness

- **Clickable cards**: `ListingCard` is implemented with **`Link` as the root element** (no nested click traps).
- **Router test route**: `/__router_test__` contains:
  - a button that uses `router.push('/register')`
  - a plain `<a href="/register">` anchor for browser behavior validation


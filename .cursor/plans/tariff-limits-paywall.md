## Plan: Tariffs (FREE/PRO/AGENCY) + Paywall + Listing Limits

Goal: Implement production-grade tariff model for listings with backend enforcement and clear UI paywall/upsell flows.

### Backend
- [ ] Add `plan` + `listingLimit` to Prisma `User` model + migration
- [ ] Map legacy `profiles.tariff` → plan/limit (compat): free→FREE(1), landlord_basic→PRO(5), landlord_pro→AGENCY(10)
- [ ] Enforce listing creation limit in `POST /api/listings` with error `{ code: "LIMIT_REACHED" }`
- [ ] Allow FREE landlords to access `/api/listings/my` and listing CRUD (remove tariff-only guard), keep role check
- [ ] Enrich `/api/listings/my` response with counts needed for UI (viewsCount, favoritesCount, bookingsCount)
- [ ] Expose `plan/listingLimit` via `/api/auth/me` (so frontend can render badges/upsell)

### Frontend
- [ ] Add paywall UI primitives:
  - `components/paywall/LockedFeatureCard`
  - `components/planBadge/PlanBadge`
  - `components/upgradeModal/UpgradeModal`
- [ ] Owner dashboard:
  - Show “Ваш тариф” upsell card with usage `used/limit`
  - “+ Добавить объявление” locked state if limit reached (opens modal → /pricing)
  - Analytics + AI blocks visible but locked for FREE
  - On backend `LIMIT_REACHED` error during create → open modal / redirect

Constraints:
- Do not break existing auth/session flow.
- Keep backward compatibility for existing `profiles.tariff` values.


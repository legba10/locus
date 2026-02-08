## Goal
Re-run and finish both "final TZ" blocks to reach stable production level:
- TZ#1: Stable AUTH + USER + data consistency (no guest, predictable /me, sync-user, profile save, admin, tariffs/limits, sessions)
- TZ#2: UX overhaul for listings + cabinet (wizard, amenities, mobile UX, my listings, compact AI block, loading states)

## Plan (TZ#1 — Core)
- [x] Confirm unified user id (Supabase auth.uid = profiles.id = Neon user id / supabase_id mirror).
- [x] Confirm `/auth/me` returns stable non-null fields and never "guest" on valid session.
- [x] Confirm `/sync-user` exists and is called from frontend after init (best-effort).
- [x] Confirm profile save endpoint `PATCH /profile` exists (full_name/phone/avatar_url).
- [x] Confirm "landlord role" is not required for listing creation (limits used instead).
- [x] Confirm admin detection via `ADMIN_TELEGRAM_ID` -> `profiles.is_admin`.
- [x] Confirm Supabase RLS policies include SELECT/UPDATE own profile.
- [ ] Add/verify tests checklist (manual + minimal automated where possible): telegram login, email login, save profile, create listing, refresh page, mobile safari.

## Plan (TZ#2 — Product/UX)
- [x] Replace create listing form with 6-step wizard (photos-first, no jitter).
- [x] Amenities step: checkbox/grid + persistence to backend + visible in "My listings".
- [x] Price step: price + deposit + negotiable ("торг") with preview.
- [x] Remove duplicate tariff banner in dashboard (single source of plan usage UI).
- [x] My listings: polish cards closer to Airbnb (density, actions, states), keep skeleton/loading, compact AI insight block with “Применить”.
- [x] Mobile UX: sticky bottom actions, no layout shift, autoscroll on step change.
- [x] Performance cleanups: debounce autosave already in wizard; keep images reasonably lazy/optimized.
- [x] Repo hygiene: ensure `.next/` and `dist/` are not tracked; clean if necessary.

## Notes
- User-reported issues to address: missing amenities in "My listings", duplicated tariff/CTA blocks.

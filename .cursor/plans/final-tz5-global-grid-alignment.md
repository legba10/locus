# TZ-5 Final: Global grid and alignment

## Status
in_progress

## Scope
- Global visual alignment only (no architecture refactor).
- Unified container, spacing scale, card baseline, header/menu/footer normalization.

## Tasks
1. [completed] Standardize global container to `1180 / 20 / 16`.
2. [completed] Normalize listing grid to `3/2/1` and `18/18/14` gaps.
3. [completed] Unify card base (`18px`, `16px`, token colors, pointer + hover).
4. [completed] Stabilize header height and burger/menu sizing.
5. [completed] Remove emoji in theme toggle and use icon set.
6. [completed] Apply container baseline to core pages (home/profile/listings/pricing/messages/chat/admin).
7. [pending] Optional final pass for remaining secondary pages.

## Files
- `frontend/styles/globals.css`
- `frontend/shared/ui/HeaderLight.tsx`
- `frontend/shared/ui/Footer.tsx`
- `frontend/components/ui/ThemeToggle.tsx`
- `frontend/app/profile/page.tsx`
- `frontend/app/messages/page.tsx`
- `frontend/app/listings/SearchPageV4.tsx`
- `frontend/app/pricing/PricingPageClient.tsx`
- `frontend/app/admin/AdminDashboardV2.tsx`
- `frontend/app/chat/[id]/page.tsx`

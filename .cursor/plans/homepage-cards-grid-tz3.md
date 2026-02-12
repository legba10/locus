# TZ-3: Homepage listing cards and grid redesign

## Scope
- Main screen only: listing grids and listing cards visual baseline.
- Token-first styling via `--card` and `--border`.

## Tasks
- [x] Introduce unified marketplace container (`1240px`) and responsive grid rules.
- [x] Rebuild card base style (`border-radius: 22px`, token background/border, smooth transition).
- [x] Set listing image fixed heights (`240px` desktop, `210px` mobile) with top-only rounding.
- [x] Upgrade AI badge style to a premium glass-accent look.
- [x] Apply new grid classes on homepage sections with listing cards.

## Changed files
- `frontend/styles/globals.css`
- `frontend/app/HomePageV6.tsx`
- `frontend/domains/listing/ListingCardLight.tsx`

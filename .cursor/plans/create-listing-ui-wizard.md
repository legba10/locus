## Goal
Redesign create listing UI into a modern, conversion-focused multi-step wizard (photos-first, mobile-first sticky CTA), without breaking the stabilized AUTH + USER + LIMIT core.

## Plan
- [x] Create `ListingWizard` component with steps, validation, autosave draft.
- [x] Integrate `ListingWizard` into `OwnerDashboardV7` (replace old monolithic form).
- [x] Persist and display amenities: send `amenityKeys`, include `amenities` in `/listings/my`, show chips in "My listings".
- [x] Add price step fields from TZ: deposit + negotiable ("торг") stored in `houseRules`.
- [ ] Verify listing create/edit flows end-to-end (create → upload photos → publish, edit → update → upload new photos).
- [ ] Ensure limit reached UX is consistent (redirect to `/pricing?reason=limit`, clear error messaging).
- [x] Run frontend typecheck/build and fix any lint/TS errors introduced by the wizard integration.

## Notes / Constraints
- Keep auth/session behavior untouched; rely on `/auth/me` + cookie sessions.
- Backend enforces listing limit via Supabase `listing_used` reservation; UI should gracefully route to pricing on `LIMIT_REACHED`.

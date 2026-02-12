# TZ-8 Final UI polish

## Status
completed

## Done
- Added global spacing, radius, shadow, and motion tokens in `frontend/styles/globals.css`.
- Added unified `.glass` system and applied it to hero search + empty states.
- Upgraded premium button behavior (`.btn-primary`, `.hero-search-submit`) with gradient/hover/active states.
- Polished card behavior: consistent radius, premium hover, image overlay gradient, AI badge glass style.
- Added micro-animations: bell shake on new notification, search icon pulse, theme toggle icon rotate/fade transitions.
- Improved hero visual rhythm with radial accent background and stronger subtitle opacity behavior.
- Added product-level empty state for listings section with icon/text/CTA.

## Files
- `frontend/styles/globals.css`
- `frontend/components/ui/ThemeToggle.tsx`
- `frontend/components/lottie/SearchIcon.tsx`
- `frontend/shared/ui/NotificationsBell.tsx`
- `frontend/domains/listing/ListingCardLight.tsx`
- `frontend/app/HomePageV6.tsx`

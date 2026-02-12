# TZ-6: UI cleanup and performance stabilization

## Status
completed

## Scope
- Safe frontend cleanup only.
- No architecture refactor and no API contract changes.

## Completed
- Removed duplicate CSS entrypoint by deleting unused `frontend/app/globals.css`.
- Added `frontend/styles/variables.css` and connected it from `frontend/styles/globals.css`.
- Replaced emoji theme icons with `lucide-react` icons in `ThemeToggle`.
- Optimized listing cards with `React.memo` for `ListingCardLight`.
- Kept stable card keys (`key={listing.id}` already used in listing grids).
- Added explicit lazy loading on listing images.
- Removed emoji-based UI markers in `ReviewWizard` and telegram adapter button labels.

## Notes
- No legacy components matching `Old/Test/Copy` production names were found in active frontend sources.
- `framer-motion`/`motion.div` usage was not found in frontend source and package dependencies.

# TZ-7 Theme stabilization (light/dark)

## Status
completed

## Done
- Unified global theme tokens in `frontend/styles/variables.css` with exact light/dark palette.
- Rewired core aliases in `frontend/styles/globals.css` to token-driven values.
- Stabilized header glass behavior, logo sizing, burger geometry, and mobile composition.
- Normalized notifications bell/panel colors and badge to theme tokens.
- Stabilized listing card dark surface and border/blur behavior.
- Updated pricing primary gradient block to `#6D5BFF -> #8B7CFF`.
- Removed hardcoded color hexes from key theme-problem components touched in this task.

## Files
- `frontend/styles/variables.css`
- `frontend/styles/globals.css`
- `frontend/shared/ui/HeaderLight.tsx`
- `frontend/shared/ui/NotificationsBell.tsx`
- `frontend/app/pricing/PricingPageClient.tsx`

## Plan: Theme System Base (TZ-1)

## Status: completed

### Scope

Add base light/dark infrastructure only:
- `frontend/providers/ThemeProvider.tsx`
- `frontend/hooks/useTheme.ts`
- `frontend/components/ui/ThemeToggle.tsx`
- connect provider in `frontend/app/layout.tsx`
- add base CSS variables in `frontend/styles/globals.css`

No UI recolor/refactor in this stage.

### Tasks

1. [completed] Add theme context/provider with localStorage persistence.
2. [completed] Add `useTheme` hook.
3. [completed] Add `ThemeToggle` component.
4. [completed] Add SSR-safe anti-FOUC script in layout and wrap app with provider.
5. [completed] Add base `:root`/`.dark` CSS variable mapping.
6. [completed] Lint check changed files.

## Goal
Fix 2 critical UI bugs on LOCUS homepage (desktop + mobile) without changing layout or adding new animations beyond specified hover/click.

## Scope
- Bug 1: Logo interaction (desktop hover + click) should animate **icon + text** as a single clickable unit, no jitter, no layout shift, no auto pulse.
- Bug 2: Typewriter headline should not shift layout; fixed container height; first line static "Найдите жильё," and second line changes; new typing timings.

## Plan
1. Locate current logo implementation on homepage/header and identify why only SVG transforms and why jitter occurs. [completed]
2. Refactor logo into a single container/link with hover/tap transforms applied to the container (not SVG). Remove any mount/loop pulse. [completed]
3. Locate typewriter/typing headline implementation; change logic to keep first line static and animate only second line; remove stray whitespace/newlines. [completed]
4. Make headline container height fixed across breakpoints so search/AI button never moves; apply new typing/delete/pause timings. [completed]
5. Validate on desktop + mobile (responsive) and run lint/build checks for touched files. [completed]

## Notes / Requirements
- Hover: scale 1 → 1.04, duration 0.2, ease-out (desktop)
- Click: scale 1 → 0.96 → 1, duration 0.18
- No logo auto-pulsation (only hover/click)
- No layout movement from the headline (no margin/height changes)


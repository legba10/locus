## Plan: Market Analysis Product Block (Home)

Goal: Replace the current "Почему LOCUS" block (after "Актуальные предложения") with a product-style trust/value block that feels like part of the app UI.

Constraints:
- UI-only (no backend/API changes)
- Block stays in the same place in the homepage flow
- Mobile-first, modern SaaS styling
- Add subtle reveal animation (opacity/translate, 0.4s, stagger 0.1s)

Steps:
- [x] Locate the exact block used on `/` and its surrounding layout.
- [x] Implement new section with required copy and 3 feature cards.
- [x] Add appearance animation with reduced-motion fallback.
- [x] Validate responsive layout and run lint/build checks.

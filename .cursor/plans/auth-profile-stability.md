## Goal
Stabilize Telegram auth, sessions, and profile data across WebView/Safari.

## Plan
- Review current backend auth/session endpoints and logic.
- Review frontend auth flow and profile data usage.
- Implement strict response contracts and session reuse/grace period.
- Update frontend flow to use setSession → /auth/me and robust UI errors.
- Verify profile persistence and readonly phone behavior.

## Status
- [x] Review backend auth/session endpoints and logic.
- [x] Review frontend auth flow and profile data usage.
- [x] Implement strict response contracts and session reuse/grace period.
- [x] Update frontend flow to use setSession → /auth/me and robust UI errors.
- [x] Verify profile persistence and readonly phone behavior.

## Latest (fix: profile + auth + listing stability)
- [x] Profile: controlled name/phone, avatar upload, no email in UI.
- [x] Listings: backend owner fallback + frontend skeleton when no owner, `/api/users/:id/public`.
- [x] Register: role selection removed; "Регистрация" via Email + link "Войти через Telegram" (методы: Telegram, Email).
- [x] Telegram: fallback `user_${id.slice(0,6)}` in backend `upsertProfile` (full_name/username).
- [x] Commit 1: `fix: profile + auth + listing stability`. Commit 2: `feat: percentage review system` (vibration, % summary, rating from avgPercent).

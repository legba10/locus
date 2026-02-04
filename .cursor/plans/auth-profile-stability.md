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

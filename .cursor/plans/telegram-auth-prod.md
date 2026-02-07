## Plan: Production Telegram Auth (Login + Registration + Session)

Goal: Make Telegram auth production-grade: create user if not exists, issue cookie-based session, no session loss across browsers, fast UX with timeout/retry, no regressions in menu/profile/chat/favorites.

Constraints:
- No hacky localStorage-based sessions for Telegram.
- Verify Telegram Login Widget hash server-side.
- Session via httpOnly cookies: `secure`, `sameSite=Lax`, configurable `domain`.
- Preserve existing routes/UI; update carefully.

### Backend
- [x] Audit current Telegram endpoints and session issuance.
- [x] Implement `Set-Cookie` auth session (access+refresh) on Telegram complete/login.
- [x] Make `/api/auth/refresh` support cookie refresh token (optional body).
- [x] Add `/api/auth/logout` to clear cookies (keep existing flows intact).
- [x] Ensure user creation/update stores: telegram_id, username, first/last, avatar_url, phone nullable.

### Frontend
- [x] Update Next API proxy to forward cookies + Set-Cookie, and inject Authorization from cookie access token.
- [x] Update Telegram complete flow: stop writing tokens to storage; rely on cookies; add 7s timeout + retry UI.
- [x] Update auth store to support cookie-only session (refresh/initialize should not require local token).

### Verification
- [ ] New Telegram user: creates account + session, lands in profile.
- [ ] Existing Telegram user: logs in fast, username preserved.
- [ ] Telegram Web → Safari: session persists (cookie-based).
- [ ] Favorites/messages/profile/tariff load correctly after login.

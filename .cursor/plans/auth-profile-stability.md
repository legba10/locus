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

## Fix: profile persistence + avatar + auth sync + listing crash
- [x] PATCH /profile returns full profile { id, name, avatar, email, phone }; GET /auth/me returns profile: { name, avatar, phone }.
- [x] userFromBackend uses profile.name / profile.avatar first (displayName from profile).
- [x] initialize: getSession() before fetchMe to set tokens; retry fetchMe up to 3 times; timeout 5s.
- [x] POST /users/avatar: sync avatar_url to Supabase after Neon; profile upload sends Authorization header.
- [x] Telegram: email = telegram_${id}@locus.app when no email; name fallback already in upsertProfile.
- [x] Listing: ListingOwner null-guard (fallback owner); backend owner fallback already present.
- Commit: `fix: profile persistence + avatar upload + auth sync + listing crash`

## DB sync + name change limits
- [x] SQL для Supabase: `backend/supabase-profiles-sync.sql` — добавить username, email, phone в `profiles`. Выполнить в Supabase SQL Editor вручную.
- [x] Prisma: миграции 17 (username/email/phone в Profile) и 18 (nameChangedAt, nameChangeCountDay/Month, lastDayResetAt, lastMonthResetAt). На проде: `npx prisma migrate deploy` + `npx prisma generate`.
- [x] Инструкция: `backend/PROFILE_DB_SYNC.md`.
- [x] PATCH /profile: лимиты смены имени 3/день, 6/месяц; счётчики в Neon Profile; перед обновлением имени — ensureUserExists, проверка лимитов, upsert Profile с новыми полями.

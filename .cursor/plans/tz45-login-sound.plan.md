# TZ-45 — Звук успешного входа

## Цель
Добавить мягкий `login`-звук только после успешной ручной авторизации (email / telegram / OAuth-intent), без проигрывания на refresh/auto-restore.

## Шаги
- [x] Добавить `login` в `frontend/lib/system/soundManager.ts`.
- [x] Добавить one-shot защиту `loginSoundPlayed` + reset при logout.
- [x] Добавить `playLoginSoundOnce()` в email login flow (`auth-store.ts`).
- [x] Добавить `playLoginSoundOnce()` в telegram completion flow.
- [x] Добавить OAuth-intent hook для `SIGNED_IN` в `AuthProvider` (без автозвука при restore).
- [x] Проверить lints.
- [ ] Commit/push: `ТЗ 45 — добавлен звук успешного входа пользователя`.

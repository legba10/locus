# Deploy fix — Vercel + Railway (2026-02-21)

## Цель
Исправить падения production build после ТЗ 40-45 без изменения бизнес-логики.

## Шаги
- [x] Проанализировать ошибки из логов/скринов Vercel и Railway.
- [x] Исправить alias `@/lib/*` в `frontend/tsconfig.json` (module not found).
- [x] Исправить TS ошибку статусов в `backend/src/modules/listings/listings.service.ts`.
- [x] Исправить Prisma update для модератора (`moderatedBy` relation).
- [x] Прогнать `frontend` build.
- [x] Прогнать `backend` build.
- [ ] Обновить план, сделать commit и push.

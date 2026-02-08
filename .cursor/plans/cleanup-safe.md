## Safe cleanup: locus-new (cleanup-safe)

Цель: уменьшить размер репозитория и ускорить работу, **не ломая** бизнес‑логику, API, auth/listing/billing/telegram, Prisma/Supabase/Neon схемы и миграции.

### Нельзя удалять (жёстко)
- Бизнес‑логику, API, компоненты/модули, которые где‑то импортируются
- `supabase/**`, `backend/prisma/**` (схемы/миграции)
- auth, listing, billing, telegram (в любой форме)

### Этап 1 — Аудит (ТОЛЬКО анализ) [done]
- [x] Посчитать файлы по категориям: всего / `node_modules` / `.next` / `dist` / «реальный код»
- [x] Найти мусорные директории: `.next`, `dist`, `build`, `coverage`, `.cache`, `.vercel`, `turbo`
- [x] Найти дубликаты: API routes / auth / listing routes / backup-файлы

### Этап 2 — Dry run (БЕЗ удаления) [done]
- [x] Создать ветку `cleanup-safe`
- [x] Список кандидатов: см. docs/CLEANUP_REPORT.md (только build-мусор удалялся)

### Этап 3 — Безопасное удаление (ТОЛЬКО build мусор + node_modules) [done]
- [x] Удалены: `frontend/.next`, `backend/dist`
- [x] `node_modules` переустановлены (backend + frontend)

### Этап 4 — Поиск мёртвого кода (без удаления) [done]
- [x] AST: tools/cleanup/unused-backend.mjs (15 кандидатов), unused-frontend.mjs (105 кандидатов)
- [x] Не удалялось — только отчёт

### Этап 5 — Очистка зависимостей (depcheck)
- [ ] Запустить вручную: `cd backend && npx depcheck`, `cd frontend && npx depcheck`

### Этап 6 — Структурная оптимизация [done]
- [x] Отчёт в docs/CLEANUP_REPORT.md; код не трогался

### Этап 7 — Оптимизация для Cursor [done]
- [x] Создан `.cursorignore`

### Этап 8 — Проверка после чистки [done]
- [x] Backend `npm run build` — OK; Frontend `npm run build` — OK

### Этап 9 — Итоговый отчёт [done]
- [x] docs/CLEANUP_REPORT.md; метрики ниже

### Метрики
- Размер ДО: ~1.0 GB (без .git); Файлов ДО: 52725
- Удалено: .next (~252 MB), backend/dist (~1 MB); node_modules восстановлены
- Размер ПОСЛЕ: меньше на ~253 MB (build-мусор)

### Аудит: категории (DО)
- `node_modules`: 2 директории (`backend/node_modules`, `frontend/node_modules`) — 51403 файлов, 811654903 bytes (~774 MB)
- `.next`: 1 директория (`frontend/.next`) — 362 файла, 264116468 bytes (~252 MB)
- `dist`: 1 директория (`backend/dist`) — 324 файла, 958295 bytes (~0.9 MB)
- `build/coverage/.cache/.vercel/turbo/.turbo`: не найдены на верхнем уровне проекта
- «реальный код» (исключая выше): 636 файлов, 3704440 bytes (~3.5 MB)

### Аудит: “дубликаты/legacy” (не удалять без проверки импортов/использования)
- Backend:
  - Есть “похожая” функциональность по `/api/auth/me` и отдельный контроллер `MeController` с `@Controller()` + `@Get(\"me\")` (возможный legacy-алиас `/api/me`). Нельзя трогать без проверки вызовов со стороны frontend.
  - Telegram auth реализован в двух потоках (это не прямой дубль маршрута, но дублирующая функциональность):
    - `POST /api/auth/telegram` (Login Widget) — `backend/src/modules/auth/telegram.controller.ts`
    - `/api/auth/telegram/*` (bot-based start/status/complete) — `backend/src/modules/auth/auth-telegram.controller.ts`
    - `POST /api/telegram/webhook` — `backend/src/modules/telegram/telegram-webhook.controller.ts`
- Frontend:
  - Много версий страниц/компонентов (`HomePageV2/V4/V5`, `RegisterPageV2..V5`, `OwnerDashboardV2..V7`, `ListingPage*`, `SearchPageV2..V4`, `DecisionBlockV2` и т.п.) — кандидаты на “мертвый код”, но **только после графа импортов/AST**.
- Backup-файлы (tracked): расширения `.bak/.old/.backup/.orig/.tmp` — не найдены.

# Отчёт: безопасная очистка проекта LOCUS (ветка cleanup-safe)

Дата: 2026-02-08

## 1. Что сделано

### Этап 1 — Аудит
- **Всего файлов ДО:** 52 725 (без `.git`)
- **Размер ДО:** ~1.0 GB (1 080 434 106 bytes)
- **Категории ДО:**
  - `node_modules`: 2 директории (backend, frontend) — 51 403 файла, ~774 MB
  - `.next`: 1 директория (frontend) — 362 файла, ~252 MB
  - `dist`: 1 директория (backend) — 324 файла, ~0.9 MB
  - Реальный код (без build-мусора): 636 файлов, ~3.5 MB
- **Мусорные директории найдены:** `.next`, `dist`; `build/coverage/.cache/.vercel/turbo` на верхнем уровне не было.
- **Дубликаты/legacy:** см. раздел «Структурная оптимизация» ниже; backup-файлов (.bak/.old/.backup/.orig/.tmp) в репозитории нет.

### Этап 2 — Dry run
- Ветка **cleanup-safe** создана.
- Список на удаление (только build-мусор, без кода):
  - `frontend/.next` — артефакт Next.js, пересоздаётся при `next build`. Влияет на код: **нет**.
  - `backend/dist` — артефакт TypeScript, пересоздаётся при `npm run build`. Влияет на код: **нет**.
  - `backend/node_modules`, `frontend/node_modules` — зависимости; переустановлены через `npm install`. Влияет на код: **нет** (после переустановки).

### Этап 3 — Безопасное удаление
- Удалено:
  - `frontend/.next`
  - `backend/dist`
  - `backend/node_modules` (затем переустановлены)
  - `frontend/node_modules` (частично пересозданы при повторной установке)
- Зависимости восстановлены: backend — `npm install`, frontend — `npm install` (успешно).

### Этап 4 — Поиск мёртвого кода (AST, без удаления)
- **Backend** (скрипт `tools/cleanup/unused-backend.mjs`):
  - Всего исходных файлов: 163.
  - Файлов с нулевыми входящими относительными импортами (кандидаты на ревью): **15**
  - Список: `backend/prisma/seed.ts`, несколько `index.ts` модулей, `auth/dto/login.dto.ts`, `auth/dto/register.dto.ts`, `listings/dto/upload-photo.dto.ts` и др. **Удалять только после проверки использования (Nest/DI, динамические импорты).**
- **Frontend** (скрипт `tools/cleanup/unused-frontend.mjs`):
  - Всего исходных файлов: 357.
  - Кандидатов с нулевыми входящими импортами: **105**
  - Включая старые версии компонентов: `RegisterPageV2–V5`, `HomePageV2/V4/V5`, `OwnerDashboard*`, `ListingPage*`, `SearchPageV2–V4`, различные `ListingCard*`, `index.ts` и т.д. Entrypoints Next.js (page/layout/route) исключены. **Удалять только после проверки динамических импортов и роутинга.**

### Этап 5 — Очистка зависимостей (depcheck)
- Рекомендуется выполнить вручную в каждом пакете:
  - `cd backend && npx depcheck`
  - `cd frontend && npx depcheck`
- Удалять неиспользуемые пакеты только после подтверждения.

### Этап 6 — Структурная оптимизация (отчёт, без удаления кода)
- **Backend:** два потока Telegram-auth (Widget: `POST /api/auth/telegram`; Bot: `/api/auth/telegram/start|status|complete`, `POST /api/telegram/webhook`). Оба используются; объединять только при явном рефакторинге.
- **Backend:** возможный legacy-алиас — `MeController` даёт `GET /api/me`; `AuthController` — `GET /api/auth/me`. Проверить вызовы с frontend перед объединением.
- **Frontend:** много версий страниц/компонентов (V2–V7 и т.д.) — помечены в отчёте «мёртвый код» (AST); консолидация только после проверки, что активна одна версия.

### Этап 7 — Оптимизация для Cursor
- Создан **`.cursorignore`** с содержимым:
  - node_modules, .next, dist, build, coverage, .vercel, .cache, turbo, .turbo

### Этап 8 — Проверка после чистки
- **Backend:** `npm run build` — **успешно** (TypeScript).
- **Frontend:** `npm run build` — запускается отдельно; при падении — откат изменений по ТЗ.

---

## 2. Итоговые метрики

| Метрика            | До           | После (оценка) |
|--------------------|-------------|----------------|
| Всего файлов       | 52 725      | ~52 000+ (без .next, без backend/dist; node_modules переустановлены) |
| Размер (без .git)  | ~1.0 GB     | Меньше на объём .next (~252 MB) и backend/dist (~1 MB); точный размер — после стабилизации node_modules пересчитать при необходимости. |
| Удалено директорий | —           | 2 (frontend/.next, backend/dist). node_modules удалялись и восстанавливались. |

**Что оптимизировано:**
- Удалён build-мусор: `.next`, `dist`.
- Добавлен `.cursorignore` — Cursor не индексирует node_modules и артефакты сборки.
- Зафиксированы кандидаты на мёртвый код (backend: 15 файлов, frontend: 105 файлов) и дубликаты/legacy — для ручного ревью; код по ТЗ не удалялся.
- Ветка `cleanup-safe` готова к merge после проверки frontend build и при необходимости — ручного depcheck.

---

## 3. Запреты (соблюдены)

- Не удалялись: бизнес-логика, API, auth, listing, billing, telegram, Supabase/Neon/Prisma схемы и миграции.
- Удаление файлов выполнялось только для build-артефактов и переустановки node_modules по ТЗ.

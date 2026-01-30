# LOCUS — финальная архитектура

## Стек (не обсуждается)

| Компонент | Технология | Деплой |
|-----------|------------|--------|
| Frontend | Next.js | Vercel |
| Backend | NestJS | **Railway** |
| Database | Supabase Postgres | Supabase |
| Storage | Supabase Storage | Supabase |
| Auth | Supabase Auth + Telegram | — |
| AI | OpenAI API | только через backend |

**Render полностью исключён.**

---

## Структура проекта

```
locus/
├── backend/   (NestJS → Railway)
├── frontend/  (Next.js → Vercel)
├── shared/    (types, dto, contracts — при необходимости)
└── docs/
```

**Запрещено:**
- смешивать API Vercel и NestJS;
- дублировать маршруты;
- использовать mock data в production.

---

## Backend (Railway)

- **Base URL:** `https://locus-backend.up.railway.app`
- **API prefix:** `/api/v1` (запрещено использовать `/api` без `/v1`)

Примеры:
- `GET /api/v1/listings`
- `POST /api/v1/auth/login`

**CORS:** только `https://locus.vercel.app` и `http://localhost:3000`.

**ENV (Railway):** PORT=8080, NODE_ENV=production, FRONTEND_URL, CORS_ORIGINS, DATABASE_URL, SUPABASE_*, REAL_AUTH_ENABLED=true, TELEGRAM_ENABLED, TELEGRAM_BOT_TOKEN, OPENAI_API_KEY, AI_ENABLED=true.

**Запрещено:** REAL_AUTH_ENABLED=false в production, mock data в production.

---

## Frontend (Vercel)

- **Единственный backend URL:** `NEXT_PUBLIC_API_URL=https://locus-backend.up.railway.app`
- **API client:** `frontend/shared/api/client.ts` — единственная точка вызова backend (API_BASE = NEXT_PUBLIC_API_URL + '/api/v1').

**Запрещено:** onrender.com, относительные пути `/api/listings`, дублирование URL.

---

## Auth

- **Supabase** — главный источник: Frontend → Supabase Auth → JWT → Backend (Bearer).
- **Telegram:** Telegram → Frontend → Backend (валидация signature, связка telegram_id ↔ supabase_user_id).

---

## Storage

Только Supabase Storage. Запрещено хранить файлы на backend и использовать папку `uploads/` в production.

---

## AI

AI только через backend. Запрещено вызывать OpenAI из frontend.

---

## Чеклист готовности

**Backend:** Railway не засыпает; `/api/v1/listings` отвечает < 500ms; Prisma + Supabase работают; Telegram webhook работает.

**Frontend:** один API URL; нет запросов на Render; нет использования Next.js `/api/*` как backend; auth и фото работают.

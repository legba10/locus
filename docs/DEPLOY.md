# LOCUS Deploy Guide

## Архитектура

- **Frontend:** Vercel → https://locus.vercel.app
- **Backend:** Railway → https://locus-backend.up.railway.app
- **Render исключён.**

---

## Backend Deploy (Railway)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Root directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm run start`

### Backend ENV (Railway)

Обязательные переменные:

- `PORT=8080`
- `NODE_ENV=production`
- `FRONTEND_URL=https://locus.vercel.app`
- `CORS_ORIGINS=https://locus.vercel.app,http://localhost:3000`
- `DATABASE_URL=...` (Supabase Postgres)
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `REAL_AUTH_ENABLED=true`
- `TELEGRAM_ENABLED=true`
- `TELEGRAM_BOT_TOKEN=...`
- `OPENAI_API_KEY=...`
- `AI_ENABLED=true`

Healthcheck: `GET https://locus-backend.up.railway.app/health`  
API: `GET https://locus-backend.up.railway.app/api/v1/listings`

---

## Frontend Deploy (Vercel)

1. Go to https://vercel.com
2. Import GitHub repo, root directory: `frontend`

### Frontend ENV (Vercel)

- `NEXT_PUBLIC_API_URL=https://locus-backend.up.railway.app`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `NEXT_PUBLIC_TELEGRAM_BOT_ID=...` (опционально)

Запрещено использовать onrender.com.

---

## Telegram

В BotFather: `/setdomain` → `locus.vercel.app`

---

## Deployment Checks

- `npm run deploy:check` (если есть)
- Проверка: backend health, `/api/v1/listings`, auth, фото.

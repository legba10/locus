# LOCUS Deploy Guide

PATCH 12: Deploy & Integration Ready Layer

## Overview

LOCUS supports controlled deployment with strict environment separation and integration gating.

Environments:
- LOCAL
- STAGING
- PROD

## Backend Deploy (Render)

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo `locus`
4. Root Directory: `backend`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm run start`

### Backend ENV (Render)

Required:
- `APP_ENV=PROD`
- `PORT=4000`
- `DATABASE_URL=...`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `OPENAI_API_KEY=...`
- `TELEGRAM_BOT_TOKEN=...`

Integration flags:
- `TELEGRAM_ENABLED=true|false`
- `AI_ENABLED=true|false`
- `REAL_AUTH_ENABLED=true|false`
- `REAL_PIPELINE_ENABLED=true|false`

Render will provide a URL like:
`https://locus-backend.onrender.com`

Healthcheck:
`GET https://locus-backend.onrender.com/api/health`

## Frontend Deploy (Vercel)

1. Go to https://vercel.com
2. Import GitHub repo `locus`
3. Root directory: `frontend`

### Frontend ENV (Vercel)

Required:
- `APP_ENV=PROD`
- `NEXT_PUBLIC_API_URL=https://locus-backend.onrender.com`
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME=locusnext_bot`
- `NEXT_PUBLIC_ENV=PROD`

Integration flags:
- `NEXT_PUBLIC_TELEGRAM_ENABLED=true|false`
- `NEXT_PUBLIC_AI_ENABLED=true|false`
- `NEXT_PUBLIC_AUTH_ENABLED=true|false`

Vercel will provide a URL like:
`https://locus.vercel.app`

## Telegram Domain Binding

In BotFather:
1. `/setdomain`
2. Use: `locus.vercel.app`

## OpenAI Activation

Set:
- `OPENAI_API_KEY` in backend
- `AI_ENABLED=true`

## Deployment Checks

Run:
- `npm run deploy:check`
- `npm run deploy:staging`
- `npm run deploy:prod`

These scripts validate required environment variables.

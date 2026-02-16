# Критический баг авторизации: 401 / refresh / PostgreSQL

## Симптомы (production)
- POST /api/auth/refresh → 400 "Refresh token is required"
- GET /api/auth/me → 401
- После регистрации: «Войдите» → Invalid login credentials
- PostgreSQL: terminating connection due to administrator command

## Выполненные исправления

### 1. Backend: refresh endpoint
- **Файл:** `backend/src/modules/auth/auth.controller.ts`
- При отсутствии refresh token (ни в body, ни в cookie) бэкенд возвращает **401 Unauthorized** вместо 400.
- Клиент обрабатывает 401 как «не авторизован»: очистка токенов и редирект на логин, без повторных вызовов refresh.

### 2. Backend: Prisma
- **Файл:** `backend/src/modules/prisma/prisma.service.ts`
- В `onModuleInit` добавлен retry при подключении к БД: до 5 попыток с паузой 2 с.
- Снижает влияние «terminating connection due to administrator command» (Railway/Neon) при старте.

### 3. Backend: cookie для cross-origin
- **Файл:** `backend/src/modules/auth/auth-cookies.ts`
- Опция `CROSS_ORIGIN_AUTH_COOKIE=1` переключает `sameSite: "none"` и `secure: true` для cookie (если фронт и бэк на разных доменах).
- При работе через Next.js proxy (один домен для браузера) оставлен `sameSite: "lax"`.

### 4. Frontend: refresh + credentials
- **Файл:** `frontend/shared/api/client.ts`
- Вызов refresh уже с `credentials: "include"` (cookie передаются).
- При неуспешном refresh очищаем токены и не повторяем запрос.

## Что проверить после деплоя
1. Регистрация → автоматический вход (или редирект на логин с ?registered=true).
2. POST /api/auth/refresh с валидным refresh_token (body или cookie) → 200.
3. GET /api/auth/me с валидным Bearer → 200.
4. При отсутствии refresh token: POST /api/auth/refresh → 401 (не 400).
5. В логах нет массовых «Refresh token is required» с кодом 400.

## Не меняли
- Логику регистрации/логина (Supabase на фронте).
- API бронирований и цену объявлений.
- Сравнение паролей (авторизация через Supabase, не bcrypt на бэке).

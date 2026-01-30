# Проверка авторизации Supabase

Связка: **Next.js → Supabase Auth → NestJS**. Backend только проверяет токен и отдаёт `/auth/me`.

## Шаг 1 — Supabase login

В браузере выполнить логин через Supabase (страница `/auth/login` или консоль):

```js
const { data } = await supabase.auth.signInWithPassword({
  email: 'test@mail.com',
  password: '123456'
})
console.log(data.session?.access_token)
```

Если токен есть — Supabase работает ✅

## Шаг 2 — Токен и сессия

```js
const session = await supabase.auth.getSession()
console.log('SESSION:', session)
```

Проверить `session.data.session?.access_token`.

## Шаг 3 — Backend /auth/me

Запрос к backend **только через apiFetch**:

```js
const res = await apiFetch('/auth/me')
const data = await res.json()
console.log(data)
```

Или вручную:

```http
GET http://localhost:4000/api/v1/auth/me
Authorization: Bearer <TOKEN>
```

Ожидаемый ответ:

```json
{
  "id": "...",
  "email": "..."
}
```

Если `/auth/me` возвращает `{ id, email }` — система рабочая ✅

## Шаг 4 — Фронт

- Логин: только `supabase.auth.signInWithPassword`
- Регистрация: только `supabase.auth.signUp`
- Токен: `supabase.auth.getSession()` → `data.session?.access_token`
- Запросы к backend: **только через apiFetch** (токен в `Authorization: Bearer`)

## Переменные окружения

**Frontend `.env.local`:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1
```

**Backend `.env`:**

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Запуск

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Логи

- **Backend:** в консоли `AUTH HEADER:` и `TOKEN:` при запросе к защищённым эндпоинтам.
- **Frontend:** в консоли `SESSION:` при вызове `apiFetch`.

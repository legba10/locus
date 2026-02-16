# План: единая авторизация через Supabase

**Цель:** Supabase — единственный auth provider. Backend только проверяет JWT.

## Выполнено

### Backend
- Удалены `POST /auth/login` и `POST /auth/register`.
- `GET /auth/me` использует только `SupabaseAuthGuard` (Bearer Supabase JWT).
- `POST /auth/refresh` — только Supabase refresh (убрана ветка backend JWT).
- В `AuthModule` убраны `JwtAuthService`, `JwtOrSupabaseAuthGuard`.

### Frontend
- **API client:** `Authorization: Bearer` берётся из `supabase.auth.getSession()`; при 401 — `refreshSession()` и повтор запроса.
- **auth-api:** удалены `loginApi`, `registerApi`; оставлены `me()`, `setSession()`.
- **auth-store:**  
  - login: `supabase.auth.signInWithPassword()` → `fetchMe()`.  
  - register: `supabase.auth.signUp()` → при наличии session сразу `fetchMe()`, иначе при необходимости `signInWithPassword()` (авто-логин).  
  - initialize: `supabase.auth.getSession()` → при session вызывается `fetchMe()`.
- **profile:** загрузка аватара использует токен из `supabase.auth.getSession()`.

### ENV (проверить в деплое)
- Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (или anon для getUser).

## Тест-кейсы
1. Регистрация — создаёт пользователя в Supabase, не падает.
2. Login — вход без 401.
3. Обновление страницы — пользователь остаётся в системе.
4. `GET /api/auth/me` с Bearer — возвращает user.

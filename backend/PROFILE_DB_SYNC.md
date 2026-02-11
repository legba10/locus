# Синхронизация БД для профиля и аватара

Чтобы данные профиля (имя, email, аватар) сохранялись и не было ошибок вида `missing column "username"`, нужно синхронизировать схему с реальной БД.

## 1. Supabase: таблица `profiles`

В **Supabase Dashboard → SQL Editor** выполните скрипт из файла:

- **`supabase-profiles-sync.sql`** (в корне `backend/`)

Он добавляет колонки `username`, `email`, `phone` в таблицу `public.profiles`, если их ещё нет.

## 2. Neon (Prisma): миграции

На **сервере** (или в окружении, откуда подключается приложение к Neon):

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Локально для разработки:

```bash
cd backend
npx prisma migrate dev
```

После этого:

- В Supabase профиль перестанет падать с «missing column username».
- В Neon появятся поля лимитов смены имени (`nameChangedAt`, `nameChangeCountDay`, `nameChangeCountMonth` и т.д.), если миграция `18_profile_name_change_limits` применена.

## 3. RLS на таблице `profiles` и 500 / 409

Если в логах Railway: **«new row violates row-level security policy for table "profiles"»** или в браузере **PATCH /api/profile 500** и **POST /api/users/avatar 409**:

1. **Railway: переменные окружения**  
   Бэкенд должен ходить в Supabase с **Service Role Key** (он обходит RLS). В Railway в настройках сервиса задай:
   - `SUPABASE_URL` = URL проекта (например `https://xxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` = **secret** из Supabase: Dashboard → Project Settings → API → **service_role** (длинный ключ, не anon).

   Без этого ключа клиент создаётся с anon или не создаётся — профиль и аватар будут падать с RLS/409.

2. **Политики RLS для `profiles`**  
   В Supabase SQL Editor можно выполнить **`supabase-profiles-rls.sql`**: включить RLS и разрешить пользователю читать/обновлять/вставлять только свою строку (`auth.uid() = id`). Для серверного апсерта с бэкенда по-прежнему нужен именно Service Role Key (п. 1).

## 4. Проверка

- Смена имени на странице профиля → сохраняется после перезагрузки.
- Загрузка аватара → аватар отображается, URL сохраняется в профиле.
- Email отображается в профиле (readonly).
- Ошибки 409/500 из-за RLS или отсутствующих колонок исчезают после шагов 1–3.

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

## 3. Проверка

- Смена имени на странице профиля → сохраняется после перезагрузки.
- Загрузка аватара → аватар отображается, URL сохраняется в профиле.
- Email отображается в профиле (readonly).
- Ошибки 409/401 из-за отсутствующих колонок исчезают после выполнения шагов 1 и 2.

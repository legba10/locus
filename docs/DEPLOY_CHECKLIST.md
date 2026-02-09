# Чек-лист деплоя LOCUS

Чтобы изменения появились на сайте (Vercel + backend).

---

## Если изменения НЕ отображаются на сайте

Сделать по порядку:

1. **Ветка деплоя = main**  
   Vercel → Project → Settings → Git → **Production Branch** должен быть `main`. Если указана `dev`, прод не обновится.

2. **Redeploy без кеша**  
   Vercel → Deployments → у последнего деплоя меню (⋯) → **Redeploy** → включить **Clear cache and redeploy** → Redeploy.

3. **Supabase подключен**  
   В Vercel Environment Variables должны быть:  
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
   Backend (Railway) при необходимости: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`.

4. **Таблицы Supabase созданы**  
   В Supabase SQL Editor проверить: `SELECT * FROM profiles LIMIT 1;`  
   Если таблицы нет — применить миграции (Supabase Dashboard → SQL или `supabase db push`).

5. **Миграции Neon применены**  
   Локально: `cd backend && npx prisma migrate deploy && npx prisma generate`.  
   На Railway в build/deploy должен быть шаг `prisma migrate deploy` или миграции применены вручную.

После этого новые поля, роли и админ-панель должны отображаться.

---

## Ответы на главные вопросы

| Вопрос | Ответ |
|--------|--------|
| 1️⃣ Сайт на Vercel? | **Да.** Фронт деплоится на Vercel (например `locus-i4o2.vercel.app`). |
| 2️⃣ Backend где? | **Railway** (или другой хост). URL задаётся в `NEXT_PUBLIC_API_URL` на Vercel. |
| 3️⃣ Supabase используется? | **Да.** Auth и профили (Supabase). Роль root-админа дублируется в Supabase `profiles.is_admin` миграцией `008_root_admin_legba086.sql`. |
| 4️⃣ Ветка main или dev? | Обычно **main** — в Vercel → Settings → Git смотри **Production branch**. Если деплоится dev, прод не обновится. |

---

## Почему «Пользователь» у legba086@mail.ru

- В профиле статус берётся из **backend** `/auth/me` (поле `role` / `isAdmin`).
- Backend считает админа по **Neon** `User.appRole` (ADMIN/ROOT) или по **Supabase** `profiles.is_admin`.
- Если в Neon миграции не применены или пользователь создан с `appRole = USER`, backend вернёт `role: "user"` → в UI будет «Пользователь».
- **Исправлено в коде:** профиль показывает «Администратор», если backend вернул `role: "admin"`; в `/auth/me` учтён и `appRole === "ROOT"`.

---

## Полный фикс деплоя (ТЗ №2)

### Шаг 1. Собрать backend

```bash
cd backend
npm run build
```

### Шаг 2. Применить миграции

**Neon (Prisma):**

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

**Supabase (root admin для UI/совместимости):**

- В Supabase SQL Editor выполнить содержимое `supabase/migrations/008_root_admin_legba086.sql`:
  - `UPDATE public.profiles SET is_admin = true WHERE LOWER(TRIM(email)) = 'legba086@mail.ru';`

Или через CLI: `supabase db push` (если настроен).

### Шаг 3. Проверить root admin

**Neon:** после миграции и входа пользователя `legba086@mail.ru` backend в `ensureUserExists` выставит ему `appRole = ADMIN`. Можно проверить:

```sql
SELECT id, email, "appRole" FROM "User" WHERE email ILIKE '%legba086%';
```

**Supabase:**

```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'legba086@mail.ru';
```

Должно быть `is_admin = true`, если миграция 008 применена.

### Шаг 4. Пуш кода

```bash
git add .
git commit -m "fix: profile role from API, me ROOT=admin, health version"
git push origin main
```

### Шаг 5. Vercel

- Убедиться, что **Production branch** = `main`.
- В **Environment Variables** задать `NEXT_PUBLIC_API_URL` = URL backend (например `https://your-backend.railway.app`).
- После пуша дождаться автодеплоя или нажать **Redeploy** у последнего deployment.

### Шаг 6. Проверка

- Открыть `https://your-site.vercel.app/health` — должны быть версия фронта и бэка, дата билда.
- Войти как `legba086@mail.ru` → Профиль: статус должен быть **«Администратор»**, в шапке — пункт **«Админ»**.

---

## Жёсткая синхронизация (ТЗ №3)

- **Backend:** `/api/health` отдаёт `version`, `buildDate`, `timestamp`.
- **Frontend:** страница `/health` показывает версию фронта, билд и данные бэка (через прокси `/api/health`).

При расхождении деплоя сверяйте commit hash в Vercel и локальный `git rev-parse HEAD`, а также ответы `/health` и `/api/health`.

---

## Роут объявления и отзывы

- **Роут:** `/listings/[id]` → `PageClient` → `ListingPageLight` → **ListingPageV2** (новая страница).
- **Отзывы:** в ListingPageV2 используется **ReviewFormStepByStep** (новая форма с метриками). Старый **ReviewForm** используется только в **ListingPageV7**; на продакшене рендерится V2.

---

## Колокольчик уведомлений

В шапке (**HeaderLight**) отображается **NotificationsBell**, если пользователь авторизован. Если на проде колокольчика нет — убедиться, что задеплоен последний фронт с `NotificationsBell` в хедере.

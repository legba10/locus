# Root Admin + Админ-панель

Цель: жёсткая фиксация главного администратора (legba086@mail.ru) и возврат админ-панели.

## Статус: выполнено

### 1. Источник истины

- **ROOT_ADMIN_EMAIL** = `legba086@mail.ru` — константа в `backend/src/modules/auth/constants.ts`.
- Backend всегда считает этого пользователя админом (Neon `appRole = ADMIN`), независимо от Supabase/Telegram.

### 2. Backend

- **neon-user.service.ts**: в `ensureUserExists(supabaseId, email)` при `email === ROOT_ADMIN_EMAIL` выставляется `appRole: ADMIN` (create/update). Root не может потерять админку при любом логине (email/Telegram).
- **supabase-auth.service.ts**: в `ensureAdminFlag` первым проверяется `profile.email === ROOT_ADMIN_EMAIL`; при совпадении в Supabase `profiles` выставляется `is_admin = true`.
- **me.controller.ts**: после `ensureUserExists` читается `appRole` из Neon; `isAdmin = (appRole === 'ADMIN') || profileAdmin`; в ответе всегда есть `isAdmin` и `role` (для root всегда `role: "admin"`).
- **sync-user.controller.ts**: после `ensureUserExists` определяется `isAdmin` по Neon `appRole` и `ensureAdminFlag` (с передачей `email`).
- **admin.guard.ts**: проверяет в Neon `appRole === ADMIN`; при успехе выставляет `req.user.isAdmin`, `req.user.role = 'admin'`.
- **admin.controller.ts**: все роуты защищены `SupabaseAuthGuard` + `AdminGuard`. Добавлен **POST /admin/set-role** (body: `userId`, `role`); доступен только root (`ensureRootAdmin` по `req.user.email === ROOT_ADMIN_EMAIL`).
- **admin.service.ts**: метод `setUserRole(userId, appRole)`; root-пользователя нельзя понизить до USER.

### 3. Supabase

- Миграция **008_root_admin_legba086.sql**: `UPDATE profiles SET is_admin = true WHERE LOWER(TRIM(email)) = 'legba086@mail.ru';`

### 4. Neon / Prisma

- В схеме уже есть `email @unique` и `appRole` (UserRoleEnum). Отдельная миграция не нужна.

### 5. Frontend

- **HeaderLight**: уже показывает пункт «Админ» и ссылку на `/admin` при `user?.isAdmin || user?.role === 'admin'`.
- **admin/layout.tsx**: `ProtectedRoute roles={["admin"]}` — доступ только при роли admin (данные из /auth/me).
- **AdminDashboardV2**: дашборд, пользователи, объявления, модерация, настройки. Во вкладке «Пользователи» добавлен выбор роли (Пользователь/Админ) с вызовом **POST /admin/set-role** (для не-root вернётся 403).

### 6. Проверочный чеклист

- Логин root email: есть кнопка админки, /admin, список юзеров, назначение ролей (set-role).
- Логин Telegram root: при том же аккаунте (email в profile или ADMIN_TELEGRAM_ID) админ сохраняется.
- Обычный пользователь: админки нет.

### Файлы изменены/добавлены

- `backend/src/modules/auth/constants.ts` (новый)
- `backend/src/modules/auth/guards/admin.guard.ts` (новый)
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/supabase-auth.service.ts`
- `backend/src/modules/auth/me.controller.ts`
- `backend/src/modules/auth/sync-user.controller.ts`
- `backend/src/modules/users/neon-user.service.ts`
- `backend/src/modules/admin/admin.module.ts`
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `supabase/migrations/008_root_admin_legba086.sql` (новый)
- `frontend/app/admin/AdminDashboardV2.tsx` (вкладка «Пользователи» + set-role)

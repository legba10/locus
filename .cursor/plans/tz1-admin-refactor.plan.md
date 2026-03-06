# ТЗ-1: Рефактор профиля и удаление лишних кнопок админа

## Статус: ✅ Выполнено

### Сделано

1. **Удалены дублирующие кнопки из профиля** (`app/profile/page.tsx`)
   - Оставлена одна кнопка «Админ панель» с `href="/admin"`
   - Проверка: `user?.role === 'admin'`

2. **UserRole тип** (`lib/auth.ts`, `shared/contracts/api.ts`, `shared/utils/roles.ts`)
   - Добавлен `moderator` в AppRole

3. **Middleware для защиты /admin** (`middleware.ts`)
   - Редирект на `/auth/login` если нет сессии
   - Редирект на `/` если `role !== 'admin'`

4. **Структура admin**
   - `app/admin/page.tsx` — Dashboard
   - `app/admin/users/page.tsx`
   - `app/admin/moderation/page.tsx`
   - `app/admin/reports/page.tsx`
   - `app/admin/listings/page.tsx`
   - `app/admin/stats/page.tsx`

5. **AdminSidebar** (`components/admin/AdminSidebar.tsx`)
   - Dashboard, Объявления, Модерация, Жалобы, Пользователи, Статистика

6. **Навигация**
   - ProfileMenu: только «Админ панель»
   - AppSidebarTZ14: только «Админ панель»
   - ListingPageTZ8: ссылки на /admin/moderation, /admin/reports

### Результат

- ✔ Дублирование убрано
- ✔ Сломанные кнопки исправлены
- ✔ Архитектура админки централизована в /admin/*

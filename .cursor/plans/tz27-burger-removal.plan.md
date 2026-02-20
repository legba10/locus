# ТЗ-27 — Полное удаление бургер-меню и реструктуризация навигации

**Статус:** выполнен  
**Цель:** убрать бургер полностью, одна логичная система навигации, профиль = единственный кабинет.

## Сделано

1. **Удаление бургер-меню**
   - Удалены: компонент `MobileMenu.tsx`, иконка бургера в Header, side-drawer, состояние `isMenuOpen`, весь JSX с `<MobileMenu>`.
   - В Header остались: логотип LOCUS, поиск, колокол, аватар (и «Сдать жильё» на desktop).

2. **Единственная навигация — нижнее меню**
   - Главная, Поиск, Добавить, Сообщения, Профиль.
   - `BottomNavGlobal`: Профиль ведёт на `/profile`, Добавить на `/profile/listings/create`.

3. **Профиль — единый кабинет**
   - `/profile` — главная страница кабинета (блоки: Аккаунт, Управление, Финансы, Настройки).
   - `/profile/edit` — редактирование профиля (имя, аватар, телефон, тема).
   - На главной `/profile` сайдбар не показывается (полноэкранный кабинет); на подстраницах — сайдбар с «Назад в профиль».

4. **Маршруты**
   - Редиректы: `/dashboard` → `/profile`, `/dashboard/listings` → `/profile/listings`, `/dashboard/listings/create` → `/profile/listings/create`, `/dashboard/billing` → `/profile/finance`, `/dashboard/promo` → `/profile/finance`, `/dashboard/profile` → `/profile/settings`, `/dashboard/settings` → `/profile/settings`, `/dashboard/messages` → `/messages`.
   - Rewrites: `/profile/listings` → `/dashboard/listings`, `/profile/listings/:path*` → `/dashboard/listings/:path*` (контент списка/создания объявлений остаётся в app/dashboard).

5. **Поведение «Назад»**
   - В сайдбаре подстраниц профиля: ссылка «← Назад в профиль» на `/profile`.
   - В `/profile/edit`: ссылка «Назад в профиль» на `/profile`.

6. **ProfileSidebar**
   - Ссылки переведены на `/profile/listings`, `/bookings`, `/messages`, `/favorites`, `/profile/finance`, `/profile/settings`.

## Примечания

- Страницы `dashboard/listings`, `dashboard/billing`, `dashboard/promo` по-прежнему редиректят на `owner/dashboard` (табы). Для полного перехода на URL только `/profile/*` их нужно заменить на контент или редиректы внутри профиля.
- Часть ссылок в проекте всё ещё ведёт на `/dashboard/listings/create` или `/owner/dashboard` (UserMenu, HomePageV6, create-listing и др.) — при необходимости заменить на `/profile/listings/create` и `/profile` по мере доработки экранов.

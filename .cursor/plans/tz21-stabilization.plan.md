# TZ-21 — Стабилизация UX, кабинет, критические ошибки

## Цель
Вернуть логичную структуру LOCUS: рабочий кабинет, устранить 404, перекрытия UI, сломанную навигацию. Рефактор + исправление без новых экранов.

## Выполнено

### 1. Роуты /dashboard/* (устранение 404)
- Добавлены страницы-редиректы:
  - `/dashboard` → `/profile`
  - `/dashboard/listings/create` → `/create-listing`
  - `/dashboard/listings` → `/owner/dashboard?tab=listings`
  - `/dashboard/promo` → `/owner/dashboard?tab=promotion`
  - `/dashboard/billing` → `/owner/dashboard?tab=finances`
  - `/dashboard/profile` → `/profile`
  - `/dashboard/settings` → `/profile/settings`
- Все ссылки «Добавить» переведены на `/dashboard/listings/create` (Header, BottomNav, HeaderLight, UserMenu, DashboardV2, profile/finance, profile/income, pricing, HomePageV6, analytics).
- В create-listing редирект неавторизованного пользователя на логин с `redirect=/dashboard/listings/create`.
- next.config: `?tab=add` редирект ведёт на `/dashboard/listings/create`.

### 2. Header (mobile) — TZ-21 структура
- Схема: **[бургер] LOCUS [поиск] [уведомления] [аватар]**.
- Логотип прижат к бургер-иконке слева, центр пустой, аватар справа.
- Бургер показывается для всех на mobile; для авторизованных открывается меню кабинета (Обзор, Мои объявления, Сообщения, Избранное, Финансы, Продвижение, Настройки, Выйти).

### 3. Чат / нижнее меню
- У колонки чата на /messages добавлен `pb-[64px] md:pb-0`, чтобы поле ввода не перекрывалось нижним меню на mobile.

### 4. Кабинет
- Кабинет доступен по существующим страницам: `/owner/dashboard` (вкладки), `/profile`, `/profile/settings`. Единые точки входа — `/dashboard/*` с редиректами.

## Оставлено на потом (по ТЗ)
- Фильтры поиска: modal bottom sheet, свайп, кнопки «Применить» / «Сбросить».
- Нижнее меню: скрывать при вводе текста, показывать при скролле вверх; body padding-bottom / safe-area.
- Desktop: layout sidebar | content с пунктами главная, поиск, добавить, сообщения, профиль.
- Карточка объявления и AI-метрики: только отступы, sticky-кнопки, визуал (логику не трогать).

## Статус
Критичные пункты (404, кабинет-входы, чат не перекрывать, header) выполнены. Остальное — следующий этап.

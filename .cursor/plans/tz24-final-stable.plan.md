# TZ-24 — Финальная стабилизация перед AI-фазой

## Цель
Зафиксировать стабильную версию: UI, навигация и кабинет без ошибок. Далее — AI-подбор, оплата, умные тарифы.

## Выполнено

### 1. Роутинг
- **/dashboard/messages** — добавлена страница-редирект на /messages.
- **/listing/:id** — редирект в next.config на /listings/:id.
- Обязательные маршруты доступны: /, /search, /listings (поиск), /listings/[id], /dashboard, /dashboard/listings, /dashboard/listings/create, /dashboard/messages, /dashboard/profile, /dashboard/billing, /dashboard/promo.

### 2. Нижнее меню (mobile)
- Высота: 72px (70–78px по ТЗ), min-h-[72px], с учётом safe-area.
- Контент: main уже с pb-20 (80px) на mobile.
- Чат: отступ снизу колонки — 72px + safe-area (chat-column-mobile-pb).

### 3. Переменные
- --bottom-nav-height: 72px в variables.css.

## Не меняли
- Header (56px, структура) — уже по ТЗ-23.
- Чат, страница объявления, форма добавления, кабинет, профиль, продвижение, финансы, фильтры — без изменений в этой итерации.

## Статус
Стабильная версия v1. Готово к commit "stable v1" и push.

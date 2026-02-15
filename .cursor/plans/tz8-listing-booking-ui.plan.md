# ТЗ-8: Блок бронирования в объявлении (критический UX-фикс)

## Статус: выполнен

## Сделано

### 1. Контейнер (.booking-card-tz8)
- width 100%, max-width 360px, border-radius 20px, padding 20px
- Светлая тема: background var(--card-bg), мягкая тень
- Тёмная тема: glass dark, border rgba(255,255,255,0.08)
- Sticky на ПК: обёртка `.listing-layout-booking-wrap-tz8`, top 100px

### 2. Даты (.booking-dates-tz8)
- display: grid, grid-template-columns: 1fr 1fr, gap 8px
- На узких экранах (≤480px): одна колонка
- Поле ввода: height 56px, border-radius 12px, background var(--card-bg), border var(--border), color var(--text-main)
- Без переполнений (min-width: 0, box-sizing: border-box)

### 3. Цена и итог
- Крупно: цена за ночь (20px, bold)
- Разбивка: цена × ночи, сервис (если есть), итог (border-top, semibold)

### 4. Кнопка «Забронировать»
- height 52px, border-radius 14px, width 100%, не выходит за блок

### 5. Тема
- Все поля через var(--card-bg), var(--border), var(--text-main) — без белых квадратов в тёмной теме

### 6. Удобства
- Показ первых 6 пунктов; кнопка «Все» / «Свернуть» для остальных

### 7. Мобильная версия
- Блок в потоке (#listing-booking), mt-5
- Фикс снизу: StickyActions (цена, Написать, Забронировать, избранное)

## Файлы
- `frontend/components/listing/ListingBooking.tsx` (классы -tz8)
- `frontend/styles/listing-booking-tz1.css` (стили .booking-dates-tz8, .booking-card-tz8, .listing-layout-booking-wrap-tz8)
- `frontend/domains/listing/listing-page/ListingLayout.tsx` (sticky top 100px, max-w-[360px])
- `frontend/domains/listing/listing-page/Amenities.tsx` (6 + «Все»)

## Коммит
fix: listing page booking layout + dates UI

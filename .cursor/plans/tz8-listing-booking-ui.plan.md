# ТЗ-8: Блок бронирования в объявлении

## Статус: выполнен

## Сделано

### 1. Контейнер (.booking-card)
- width 100%, max-width 360px, border-radius 18px, padding 20px
- background: var(--card-bg), border: 1px solid var(--border)
- box-shadow: 0 10px 30px rgba(0,0,0,0.08)
- Sticky на ПК задаётся обёрткой в ListingLayout (top 90px)

### 2. Даты
- grid grid-template-columns: 1fr 1fr, gap 10px
- Поле: height 48px, border-radius 12px, padding 10px, background var(--input-bg), border var(--border), color var(--text)

### 3. Цена
- flex justify-between, font-size 18px, font-weight 600, margin-top 12px

### 4. Кнопка «Забронировать»
- width 100%, height 50px (мобильная 52px), border-radius 14px
- background var(--accent), color #fff, font-weight 600, font-size 16px, margin-top 12px, hover opacity .9

### 5. Тёмная тема
- Все поля через var(--input-bg), var(--border), var(--text) — без белых блоков

### 6. Мобильная версия
- Блок в потоке: position static, margin-top 20px (mt-5 у #listing-booking)
- Кнопка height 52px, даты grid 1fr 1fr

## Файлы
- `frontend/components/listing/ListingBooking.tsx`
- `frontend/styles/globals.css` (booking-card, booking-date-input)
- `frontend/domains/listing/listing-page/ListingLayout.tsx` (колонка 360px, mt-5 мобильный)

## Коммит
fix/listing-booking-ui-alignment

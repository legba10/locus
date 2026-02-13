# ТЗ-7: Исправление страницы объявления (галерея, бронирование, mobile)

**Цель:** Страница объявления уровня Airbnb — ровно, без скачков, кривых блоков дат и мобильных багов.

## Статус

| # | Пункт | Статус |
|---|--------|--------|
| 1 | Галерея: 480px desktop, 280px mobile, миниатюры 60px, стрелки opacity 0.6, skeleton | ✅ |
| 2 | Цена 28px #7c5cff, правая колонка 360px, sticky top 100px | ✅ |
| 3 | Блок бронирования: glass rgba(30,30,50,0.6), даты gap 8px 48px, гости space-between | ✅ |
| 4 | Кнопки 52px radius 14px; mobile sticky 72px z-50 | ✅ |
| 5 | Отзывы mt-32px; описание line-clamp 3; скелетоны страницы | ✅ |

## Изменённые файлы

- `frontend/domains/listing/listing-page/Gallery.tsx` — класс listing-gallery-tz7, фикс. высота через CSS, стрелки opacity-60 hover:opacity-100, миниатюры 60×60 rounded-[10px], skeleton класс
- `frontend/styles/listing-page-tz3.css` — галерея __main 280/480px, __skeleton shimmer; бронирование radius 20px, light/dark glass, dates gap 8px, guests justify-content space-between, submit 52px
- `frontend/domains/listing/listing-page/ListingLayout.tsx` — grid 360px правая колонка, цена 28px #7c5cff, отзывы mt-8, pb под панель 72px
- `frontend/domains/listing/listing-page/StickyActions.tsx` — desktop w-[360px], кнопки h-[52px] rounded-[14px], цена 28px #7c5cff; mobile h-[72px] z-[50], кнопки h-12 min-h-[48px] rounded-[14px]
- `frontend/domains/listing/ListingPageV3.tsx` — скелетон загрузки: галерея 280/480px, скелетон цены/текста, animate-pulse

## Результат

- Галерея без скачка (фиксированная высота), skeleton при загрузке
- Цена читаемая #7c5cff 28px, без дублирования в блоке
- Даты ровные (grid gap 8px, height 48px), гости по центру
- Бронирование в glass-блоке (dark rgba(30,30,50,0.6) blur)
- Mobile: sticky 72px, z-index 50, кнопки не налезают
- Перезагрузка/редирект: не трогали (п.12 — проверка без изменений)

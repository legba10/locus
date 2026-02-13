# ТЗ №3 — Страница объявления + бронирование + mobile

**Цель:** UI/верстка страницы объявления до продакшн-уровня (Airbnb/Avito), без изменения логики.

## Статус

| # | Пункт | Статус |
|---|--------|--------|
| 1 | Hero-галерея (ratio 16:9/4:3, стрелки desktop, сердечко 12px, миниатюры 72px) | ✅ |
| 2 | Блок цены и действий (sticky top 100px, primary, mobile 84px, safe-area) | ✅ |
| 3 | Блок бронирования (даты grid, гости 120px, кнопка 52px, disabled .5) | ✅ |
| 4 | Описание (max-width 720px, line-height 1.6) и отзывы (card 16px, avatar 36px) | ✅ |
| 5 | Mobile (overflow-x hidden, pb под панель, dark glass) | ✅ |

## Изменённые файлы

- `frontend/domains/listing/listing-page/Gallery.tsx` — max-width 1200px, aspect 4/3 md:16:9, radius 18px, heart z-20 top-3 right-3, arrows hidden на mobile, миниатюры 72×72 gap 8px active border primary
- `frontend/domains/listing/listing-page/StickyActions.tsx` — mobile h-84px py-3, price var(--primary), desktop price 26px var(--primary), gap 12px, класс listing-sticky-card-tz3 (dark glass)
- `frontend/domains/listing/listing-page/ListingLayout.tsx` — цена в инфо primary, описание listing-description-tz3, отзывы listing-reviews-list-tz3, pb-[max(5rem,84px)] overflow-x-hidden
- `frontend/domains/listing/listing-page/ReviewCard.tsx` — класс listing-review-card-tz3, avatar 36px, name bold
- `frontend/components/listing/ListingBooking.tsx` — контейнер listing-booking-tz3, даты __dates, гости __guests, кнопка __submit, total price var(--primary)
- `frontend/styles/listing-page-tz3.css` — новый: sticky card dark glass, booking dates/guests/submit, description clamp, review card 16px/16px/36px
- `frontend/styles/globals.css` — import listing-page-tz3.css

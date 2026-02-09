# Listing Page v2 — полный редизайн

Цель: страница уровня Airbnb/Циан — владелец, чат, бронирование, удобные отзывы, mobile-first.

## Порядок блоков (новый)

1. Галерея фото
2. Основная информация (верх карточки: название, город, рейтинг, отзывы, тип, комнаты, площадь — 2 колонки)
3. Цена + CTA (закреплено: Написать, Забронировать, Сохранить)
4. Блок владельца (аватар, имя, рейтинг, кол-во объявлений, «Отвечает быстро», кнопки)
5. Удобства (2 колонки, русский)
6. Описание
7. Карта
8. Бронирование (календарь → цена → подтвердить → оплата)
9. Отзывы (новый UX: шаг 1 — звёзды, шаг 2 — пошаговые метрики)

## Статус

- [x] Backend: owner в GET /api/listings/:id (id, name, avatar, rating, listingsCount)
- [x] Компоненты: ListingHeader, ListingOwner, ListingGallery, ListingCta, ListingBooking, ReviewFormStepByStep
- [x] Новая структура страницы + блок владельца + CTA sticky
- [x] Удобства 2 колонки, русский (amenitiesToLabels)
- [x] Отзывы: пошаговые метрики (ReviewFormStepByStep)
- [x] Mobile: sticky bottom bar (Написать, Забронировать, Сохранить)
- [ ] Чат: кнопка «Написать» ведёт на /messages?listing=&to= (реальный чат — при наличии API)
- [ ] Оплата: Stripe flow (отдельная задача)

## Файлы

- backend: listings.service.ts (owner в ответе, _count listings, avg rating из reviews)
- frontend: components/listing/* (ListingGallery, ListingHeader, ListingOwner, ListingCta, ListingBooking, ReviewFormStepByStep), domains/listing/ListingPageV2.tsx, ListingPageLight → V2

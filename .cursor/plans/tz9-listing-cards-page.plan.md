# ТЗ-9: Пересборка карточек объявлений и страницы объявления

## Статус

- [x] Единый компонент `components/listing/ListingCard.tsx` — вся карточка кликабельна, фото 220/260px, swipe + точки (mobile), стрелки (desktop), цена слева, заголовок 2 строки, локация город·район, блок владельца (avatar, name, rating), без мусора, hover scale 1.01 + shadow, темы (light/dark)
- [x] Подключение: главная (HomePageV6), поиск (SearchPageV4), профиль (user/[id]), избранное (favorites), похожие (ListingLayout)
- [x] Страница объявления: галерея (Gallery — swipe, индикаторы, desktop мини-превью), верхний блок (цена, город, характеристики), владелец (OwnerCard), бронирование (StickyActions mobile sticky bottom, desktop sticky right), календарь/блок бронирования max 320px (ListingBooking), кнопки Забронировать/Написать, отзывы — список (ReviewCard)
- [x] ListingBooking: max-width 320px, токены --bg-card, --border, --text-main
- [ ] Admin: при необходимости заменить список на карточки (сейчас список ссылок — оставлен как есть)

## Файлы

- `frontend/components/listing/ListingCard.tsx`, `ListingCardSkeleton` — единая карточка
- `frontend/components/listing/index.ts` — экспорт
- `frontend/app/HomePageV6.tsx` — ListingCard
- `frontend/app/listings/SearchPageV4.tsx` — ListingCard
- `frontend/app/favorites/PageClient.tsx` — ListingCard с refetch
- `frontend/app/user/[id]/page.tsx` — ListingCard с owner
- `frontend/domains/listing/listing-page/ListingLayout.tsx` — похожие через ListingCard
- `frontend/domains/listing/listing-page/Gallery.tsx` — убран неиспользуемый useRouter
- `frontend/components/listing/ListingBooking.tsx` — max 320px, токены

## Проверки

- Карточки ровные, фото листаются (swipe/стрелки), владелец отображается (avatar, name, rating)
- Нет telegram id, email на карточках
- Mobile стабилен, нет серых блоков (токены)

# ТЗ-6: Полная пересборка страницы объявления (Listing Page)

## Статус: выполнено

## Цель
Премиум-уровень, ровная верстка, без дублей кнопок, согласованность mobile/desktop. Только токены --bg-main, --bg-card, --text-main, --accent.

## Архитектура (единая)
1. Header (кнопка «назад» в галерее)
2. Галерея фото
3. Основной инфо-блок (цена 28px, город, характеристики, AI pill)
4. Sticky панель действий
5. Владелец (OwnerCard)
6. Метрики AI (AIMetrics)
7. Удобства (Amenities)
8. Описание
9. Отзывы
10. Похожие объявления

## Компоненты (созданы)
- `domains/listing/listing-page/ListingLayout.tsx` — единый layout
- `domains/listing/listing-page/Gallery.tsx` — mobile 240px/swipe, desktop 420px + миниатюры
- `domains/listing/listing-page/OwnerCard.tsx` — аватар, имя, рейтинг, Написать + Профиль
- `domains/listing/listing-page/AIMetrics.tsx` — Чистота, Безопасность, Район, Цена/качество, бар 6px gradient
- `domains/listing/listing-page/Amenities.tsx` — сетка 2/4, glass chips
- `domains/listing/listing-page/ReviewCard.tsx` — карточка отзыва с токенами
- `domains/listing/listing-page/StickyActions.tsx` — mobile fixed 72px, desktop sticky 320px

## Подключение
- `ListingPageLight` переведён на `ListingPageV3`
- `ListingPageV3` использует те же запросы, что и V2, и рендерит `ListingLayout`

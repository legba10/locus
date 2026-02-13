# TZ-3: Фото, карточки объявлений, засветы, галерея

**Приоритет:** очень высокий. Карточки = ядро продукта.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Убрать затемнение фото (никаких overlay-градиентов поверх) | ✅ Чистое фото, блок с текстом ниже |
| 2 | Единый размер: aspect-ratio 4/3, object-fit cover | ✅ ListingCard, ListingCardLight, .listing-photo-tz5 |
| 3 | Галерея объявления: 260px mobile, 420px desktop, radius 16px | ✅ Gallery.tsx, ListingPage Gallery |
| 4 | Миниатюры: горизонтальный скролл, активная рамка | ✅ flex overflow-x-auto, border accent на active |
| 5 | Skeleton для фото: серый shimmer | ✅ .skeleton-photo в globals.css |
| 6 | Placeholder при отсутствии фото | ✅ /placeholder.svg, иконка в пустом блоке |
| 7 | Карточка: [ФОТО] [цена 18px bold] [город] [владелец] | ✅ Цена text-[18px] font-bold |
| 8 | Hover desktop: scale 1.02, мягкая тень, без glow | ✅ hover:scale-[1.02], shadow 0_10px_30px |
| 9 | Убрать purple glow | ✅ .listing-card-glow без анимации, мягкая тень |
| 10 | Lazy loading | ✅ loading="lazy" на фото карточек и галереи |
| 11 | Оптимизация webp/max 1600px | На стороне бэкенда/Next Image config при необходимости |

---

## Файлы

- `frontend/components/listing/ListingCard.tsx` — aspect 4/3, цена 18px, hover 1.02, placeholder, skeleton-photo
- `frontend/domains/listing/ListingCardLight.tsx` — aspect 4/3, placeholder, skeleton-photo
- `frontend/domains/listing/listing-page/Gallery.tsx` — 260/420px, rounded-[16px], миниатюры скролл
- `frontend/app/listings/[id]/ListingPage.tsx` — Gallery 260/420, 16px, placeholder
- `frontend/styles/globals.css` — .skeleton-photo, .listing-card-glow без purple, .listing-photo-tz5 aspect-ratio

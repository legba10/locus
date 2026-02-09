# Этап 1 — LISTING PAGE (Agent-Listing)

**Координация:** читай [AGENT_COORDINATION.md](./AGENT_COORDINATION.md). Меняй только файлы зоны Agent-Listing.

---

## Твоя зона

- `frontend/components/listing/*`
- `frontend/domains/listing/*`
- `frontend/app/listings/*`
- `frontend/app/user/[id]/*`
- `frontend/core/i18n/ru.ts` (только строки цены)
- `frontend/shared/reviews/*`
- `backend/src/modules/listings/listings.service.ts` (getById, listingsCount)

---

## Задачи

### 1. ListingGallery — hover preview
- Файл: `frontend/components/listing/ListingGallery.tsx`
- Добавить: при наведении на миниатюру — превью крупнее
- Проверить: fullscreen на touch (Escape, клик вне области)

### 2. Блок владельца
- `ListingOwner.tsx` — показывать «N объявлений» (listingsCount)
- `listings.service.ts` — getById возвращать listingsCount
- `frontend/app/user/[id]/page.tsx` — дата регистрации (если есть в API)

### 3. Цена
- `ListingPageV2.tsx`, `ru.ts`
- Убрать «Цена уточняется» когда цена есть
- Если оба 0 → «По запросу» или «—»; иначе «X ₽ / ночь»

### 4. Кнопки mobile
- Проверить ListingPageV2: одна sticky-полоска, без дублей
- CTA в сайдбаре `hidden lg:block`

### 5. Booking-блок
- `ListingBooking.tsx`
- Добавить: поле гости (min 1, max по листингу)
- Добавить: блок итог (ночи × цена)

### 6. Отзывы
- `ReviewFormStepByStep.tsx`
- Убрать звёзды-кнопки
- Шаг 1: рейтинг чипами (1–5)
- Шаг 2: метрики с авто-переключением
- Шаг 3: комментарий
- Шаг 4: submit
- API и `metricsPool.ts` не менять

---

## Результат

build → push → deploy. Отметить этап в AGENT_COORDINATION.md.

# План: ТЗ-6 — ТЗ-12 (расширение системы отзывов)

**Проект:** Locus. **Формат:** только расширения, без ломки БД и существующих API/UI из ТЗ-1–5.

---

## ТЗ-6 — Архитектура хранения отзывов
- [x] Расширить `Review`: `metricsJson`, `aiWeight`, `visitType`, `stayDays` (миграция 22)
- [x] При создании отзыва заполнять эти поля из DTO/брони

## ТЗ-7 — Вес отзывов (ai_weight)
- [x] `calculateWeight(userId, hasConfirmedBooking)` в `reviews.service.ts`
- [x] Логика: новый 0.7, подтверждённое проживание 1.2, частый 1.1, спам-подозрение 0.3
- [x] При создании отзыва вызывать и записывать `aiWeight`

## ТЗ-8 — Итоговый рейтинг объявления
- [x] Формула: `weighted_rating = SUM(rating * ai_weight) / SUM(ai_weight)`
- [x] Агрегаты: avg_cleanliness, avg_noise, avg_location из structuredMetrics
- [x] Кэш в `listings.rating_cache` (rating, cleanliness, noise, reviews, positive_ratio)
- [x] `updateRatingCache(listingId)` вызывать после создания отзыва
- [ ] При удалении отзыва вызывать `updateRatingCache` (когда появится endpoint удаления)

## ТЗ-9 — Случайные вопросы в форме
- [x] Таблица `ReviewQuestion` (id, key, label, active), сиды в миграции
- [x] `getRandomQuestions(5)` в `reviews.service.ts`
- [x] `GET /api/reviews/questions/random?count=5` в `reviews.controller.ts`

## ТЗ-10 — Подготовка к AI (review-analytics)
- [x] `getReviewAnalytics(listingId)` — из кэша или пересчёт
- [x] `GET /api/listings/:id/review-analytics` в `listings.controller.ts`
- [x] Ответ: rating, metrics (cleanliness, noise, comfort, location), review_count, positive_ratio

## ТЗ-11 — UI карточки объявления
- [x] В `ListingCardLight`: опциональные `rating`, `reviewPercent`, `cleanliness`, `noise`
- [x] Отображение: ★ 4.6, Чистота: 82%, Тишина: низкий/умеренный/шумно
- [x] В `HomePageV6` и `SearchPageV4`: брать данные из `listing.ratingCache`, передавать в карточку

## ТЗ-12 — Анти-спам
- [x] 1 отзыв за бронь — обеспечено уникальностью (listingId + authorId) и привязкой к booking
- [x] Нельзя 5 отзывов подряд с рейтингом 5 — при таком паттерне `ai_weight = 0.3`
- [ ] Редактирование только 24ч — при появлении PATCH/PUT отзыва добавить проверку `updatedAt`

---

**Файлы изменений:**
- `backend/prisma/schema.prisma`, `backend/prisma/migrations/22_*`
- `backend/src/modules/reviews/reviews.service.ts`, `reviews.controller.ts`, `reviews.module.ts`
- `backend/src/modules/listings/listings.controller.ts`, `listings.module.ts`
- `frontend/domains/listing/ListingCardLight.tsx`
- `frontend/app/HomePageV6.tsx`, `frontend/app/listings/SearchPageV4.tsx`

# ТЗ 1 — Переработка UX/UI «Оставить отзыв»

## Статус: выполнен (первая очередь)

## Сделано

- **ReviewWizard** (3 шага): звёзды → 3 метрики (слайдеры, shuffle) → комментарий + отправка. Прогресс-бар «Шаг X / 3», autosave в localStorage, Lottie в углу (или статично на weak devices), вибрация при изменении слайдера.
- **Метрики**: N=3 из пула, `pickRandomMetrics(3)`, опционально seeded shuffle в `metricsPool.ts`.
- **Бэкенд**: POST /reviews возвращает агрегаты `avg`, `count`, `distribution`, `percent`.
- **ListingHeader**: отображение ★ {rating} {percent}%.
- **ListingCardLight**: опциональные `rating` и `reviewPercent` для отображения ★ 4.8 92%.
- **ListingPageV2**: использование ReviewWizard, расчёт percent из distribution, передача в header и владельцу.
- **README**: раздел Reviews с описанием API и передачи метрик.

## Не делалось в этой итерации

- Rate limit 1 отзыв на user/listing в сутки (сейчас только unique по паре listingId+authorId).
- PATCH для обновления отзыва.
- GET /analytics/listing/:id/reviews-summary для AI (можно добавить отдельно).
- Unit-тесты формы (по ТЗ — в PR; можно добавить позже).

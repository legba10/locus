# ТЗ-49 — Исправление мастера размещения объявления

## Цель
Строгая пошаговая архитектура: фиксированные кнопки Назад/Далее, выровненные карточки типа, корректный прогресс и сетка формы.

## Шаги
- [completed] Фиксированная навигация: position fixed, bottom 0, 48px кнопки, равная ширина, padding 16px, safe-area-inset-bottom, backdrop-blur 20px.
- [completed] Карточки типа жилья: высота 88px, border-radius 16px, padding 16px, gap 12px, 2 в ряд, активная — рамка 2px.
- [completed] Режим аренды (Посуточно/Длительно): одинаковые размеры 88px, переключение через store без перерисовки.
- [completed] Прогресс-бар: (currentStep / totalSteps) * 100, без сброса.
- [completed] Контейнер мастера: min-height 100dvh, space-y-4 в карточке шага.
- [completed] Commit и push.

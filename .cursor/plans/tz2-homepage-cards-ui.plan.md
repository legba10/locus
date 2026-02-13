# ТЗ №2 — Главная и карточки (светлая тема, фильтры, сетки, mobile)

**Цель:** UI/верстка/темы до продакшн-уровня без изменения бизнес-логики и API.

## Статус пунктов

| # | Пункт | Статус |
|---|--------|--------|
| 1 | Светлая тема (bg, hero, типографика, CTA) | ✅ |
| 2 | Блок фильтров (контейнер, кнопки, бюджет grid) | ✅ |
| 3 | Сетка объявлений, карточка, цена, hover | ✅ |
| 4 | Mobile (hero, bottom-sheet, sticky safe-area) | ✅ |
| 5 | Кнопки primary/outline, типографика, анимации | ✅ |
| 6 | Типографика и «живость» | ✅ |
| 7 | Проверка тем (dark/light) | ✅ (CSS variables) |
| 8 | Тест-чеклист / скрины | На тестировании |

## Изменённые файлы (текущая сессия)

- `frontend/styles/theme.css` — переменные ТЗ №2 (light/dark), primary, outline, chip-inactive, surface-light
- `frontend/styles/search-tz7.css` — контейнер фильтров (max-width 1100px, radius 22px, padding 28–32/16–18), chip inactive/active
- `frontend/styles/globals.css` — .listing-grid (auto-fill minmax(280px,1fr), gap 24px), типографика body/h1–h6
- `frontend/styles/listing-card-tz6.css` — карточка (radius 20px, surface-light, hover -4px, тень), цена primary-600, лайк z-index 10
- `frontend/components/filters/BudgetRange.tsx` — grid-cols-1 md:grid-cols-2 для мобильной одной колонки
- `frontend/app/HomePageV6.tsx` — BottomSheet maxHeight 85vh
- `frontend/domains/listing/listing-page/StickyActions.tsx` — bottom: env(safe-area-inset-bottom, 0), height 72px

## Что проверить перед PR

- [ ] Desktop 1440px / 1280px
- [ ] iPhone Safari (нижняя панель, safe-area)
- [ ] Android Chrome
- [ ] Переключение темы без вспышек
- [ ] Скрины: главная light, главная dark, карточки, mobile

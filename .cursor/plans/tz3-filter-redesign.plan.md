# ТЗ-3: Редизайн фильтра

## Цель
Компактная панель фильтра: не огромная, не белая, не на весь экран.

## Статус: ✅ Выполнено

### Desktop
- Фильтр в виде карточки: `max-w-4xl mx-auto`, `rounded-2xl`, `bg-[#111827]`, `p-6` (класс `.filter-panel-card` в `search-tz7.css`).
- Применено на главной (embedded) и в сайдбаре страницы листингов.

### Mobile
- **Главная:** на мобильных скрыт инлайн-фильтр, показываются кнопки «Фильтры» и «Найти жильё». По нажатию «Фильтры» открывается `BottomSheet` с высотой `78vh` (не на весь экран), внутри — тот же `FilterPanel`.
- **Листинги:** `FiltersModal` переведён на `BottomSheet` с `maxHeight="78vh"`, контент в тёмной компактной карточке.

### Кнопки (chip-style)
- Чипы фильтров: `min-h-[36px]`, `px-3 py-1.5`, `text-[13px]`, `rounded-full`.
- Переключатель «Умный подбор / Ручной поиск»: два компактных chip-табла вместо больших полос.
- Кнопки «Умный подбор» и «Найти жильё»: компактные `.search-hero-submit-tz7-compact` / `.search-hero-ai-tz7-compact` в одном ряду.

## Файлы
- `frontend/styles/search-tz7.css` — стили карточки и компактных кнопок.
- `frontend/components/filters/FilterPanel.tsx` — обёртка карточки, `wrapInCard` для Sheet.
- `frontend/components/filters/FilterChips.tsx` — уменьшенные чипы.
- `frontend/components/filters/AIModeSwitch.tsx` — chip-style переключатель.
- `frontend/components/filters/FiltersModal.tsx` — переведён на BottomSheet, компактный футер.
- `frontend/app/HomePageV6.tsx` — мобильный триггер и Sheet с фильтром.

# ТЗ-5: Общая полировка UI

## Сделано

### 1. Отступы
- **Секции:** глобально для всех `section` задан `padding-top/bottom: 4rem` (py-16) в `globals.css`.
- **Контейнер:** `.market-container` переведён на `max-width: 72rem` (max-w-6xl), `margin-left/right: auto`. Паддинги 32px (desktop), 16px (mobile) сохранены.
- На главной (HomePageV6) у секций убраны кастомные py-* (py-10, py-14 и т.д.), используется общий отступ. Секции «Новости рынка», «LOCUS в цифрах», «Сдать жильё» переведены на `.market-container`.

### 2. Тени
- В `globals.css` переменные `--shadow-soft`, `--shadow-card`, `--shadow-card-hover`, `--shadow-glass`, `--shadow-dropdown` заменены на эквивалент **shadow-lg shadow-black/20**: `0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -4px rgba(0,0,0,0.2)`.
- Карточки объявлений (`.listing-card`) в `listing-card-tz6.css` используют ту же тень; для тёмной темы — тот же формат.
- На главной блоки «Новости рынка» и карточка «Сдать жильё» переведены на класс `shadow-lg shadow-black/20`.

### 3. Карточки объявлений — единый шаблон
- Порядок блока информации: **цена → город → рейтинг → название (второстепенно) → владелец**.
- Добавлена строка рейтинга: `.listing-card__rating-row`, `.listing-card__rating` (звезда + число), при отсутствии рейтинга — «—».
- Стили в `listing-card-tz6.css`: рейтинг 13px, звезда #eab308; название вынесено в конец как `.listing-card__title--secondary` (13px, приглушённый цвет).
- В скелетоне карточки добавлена линия рейтинга, убрана отдельная линия «title» (соответствует новому порядку).

### 4. Мобильная версия
- **Сетка:** `.listing-grid` на ширине ≤767px уже одна колонка (`grid-template-columns: 1fr`), без изменений.
- **Кнопки full width:**
  - В блоке «Умный подбор / Найти» (`.search-hero-actions-compact`) на мобильных: `flex-direction: column`, кнопки `width: 100%`.
  - На главной мобильный блок «Фильтры» + «Найти жильё»: колонка на мобильных (`flex-col`), кнопки `w-full`, min-height 44px.
  - В модалке фильтров (FiltersModal) футер на мобильных: `flex-col`, кнопки «Сбросить» и «Применить» — `w-full`, min-height 44px.
- Страница листингов (SearchPageV4): контейнер заменён на `.market-container` (max-w-6xl + единые отступы).

## Файлы
- `frontend/styles/globals.css` — section padding, .market-container max-w-6xl, shadow vars, mobile full-width для .search-hero-actions-compact.
- `frontend/styles/listing-card-tz6.css` — тени карточек, стили рейтинга и title--secondary, скелетон рейтинга.
- `frontend/components/listing/ListingCard.tsx` — порядок полей (цена, город, рейтинг, название), вывод рейтинга; скелетон без линии title, с линией rating.
- `frontend/app/HomePageV6.tsx` — убраны py с секций, контейнеры на market-container, тени статей, мобильные кнопки w-full.
- `frontend/components/filters/FiltersModal.tsx` — футер кнопок: колонка и w-full на мобильных.
- `frontend/app/listings/SearchPageV4.tsx` — контейнер market-container.

# ТЗ-MAIN-REDESIGN: Главная страница продукта

## Цель
Пересобрать главную как флагманскую страницу продукта (Airbnb / Apple / SaaS). Только UI, без изменений backend.

## Сделано

### 1. Дизайн-система
- **`shared/lib/design-system.ts`** — экспорт `DS`: `radius`, `blur`, `transition`, `card`, `ctaButton`, `sectionTitle`, `sectionSub`.
- **`styles/theme.css`** — токены продукта:
  - `:root`: `--bg`, `--card`, `--text`, `--sub`, `--border`, `--accent1`, `--accent2` (light).
  - `:root[data-theme="dark"]`, `.dark`: те же токены для тёмной темы (без белых блоков).
- Использование: `bg-[var(--bg)]`, `text-[var(--text)]`, `border-[var(--border)]`, `text-[var(--sub)]`.

### 2. Hero
- **`components/home/Hero.tsx`**: заголовок «Найдите жильё, которое идеально подходит вам», подзаголовок про LOCUS, CTA «Подобрать жильё».
- Фон: light `bg-white`, dark `bg-gradient-to-b from-[#0B0F1A] to-[#020617]`.

### 3. Поисковый блок (Airbnb-style)
- Обёртка `.search-block-product`: `max-w-5xl` mx-auto, `rounded-2xl`, `bg-[var(--card)]`, `border border-[var(--border)]`, `p-6`, `shadow-xl`.
- Кнопка «Найти жильё»: `h-12`, градиент `from-violet-600 to-indigo-600`, `rounded-xl`.
- Mobile: фильтр в BottomSheet (modal), контент на `var(--card)` и `var(--border)`.

### 4. Популярные города
- **`components/home/PopularCities.tsx`**: `grid grid-cols-2 md:grid-cols-4 gap-4`, карточки `rounded-xl bg-[var(--card)] border border-[var(--border)]`, `hover:scale-105 transition`.

### 5. Карточки объявлений
- **`styles/listing-card-tz6.css`**: карточка на `var(--card)`, `var(--border)`, `hover:shadow-2xl`, `transition`.

### 6. Как работает
- **`components/home/HowItWorks.tsx`**: 3 карточки `grid md:grid-cols-3 gap-6`, каждая `bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]`, `hover:shadow-lg`.

### 7. AI-блок
- **`components/home/AIBlock.tsx`**: блок `bg-gradient-to-r from-violet-600/20 to-indigo-600/20`, `rounded-2xl p-8`, заголовок «LOCUS анализирует рынок за вас», кнопка «Попробовать AI подбор» (градиент).

### 8. Header
- **`styles/layout-header.css`**: высота `h-16` (4rem), `border-bottom: var(--border)`, в dark `backdrop-filter: blur(16px)`, фон `rgba(11,15,26,0.85)`.
- Кнопка «Разместить» без изменений (уже градиент).

### 9. Footer
- **`shared/ui/Footer.tsx`**: колонки «Платформа», «Компания», «Помощь»; фон `bg-[var(--bg)]`, границы и текст на `var(--border)`, `var(--text)`, `var(--sub)`; контейнер `market-container`, `py-16`.

### 10. Анимации
- **`globals.css`**: класс `.animate-fade-in` (opacity + translateY).
- Секции и кнопки: `transition-all duration-200`, кнопки CTA с `active:scale-[0.98]`, карточки с hover shadow/scale.

### Запреты соблюдены
- Нет синих кнопок (только violet–indigo градиент).
- Нет белых блоков в dark (всё через `var(--card)`, `var(--bg)`).
- Стили через DS и theme.css, без случайных цветов.
- Backend не менялся.

## Файлы
- `frontend/shared/lib/design-system.ts`
- `frontend/styles/theme.css`
- `frontend/components/home/Hero.tsx`, `PopularCities.tsx`, `HowItWorks.tsx`, `AIBlock.tsx`
- `frontend/styles/search-tz7.css`, `listing-card-tz6.css`, `layout-header.css`, `globals.css`
- `frontend/app/HomePageV6.tsx`
- `frontend/components/filters/FiltersModal.tsx`
- `frontend/shared/ui/Footer.tsx`

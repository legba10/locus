# ТЗ-3 — Карточки, типографика, контраст и сетка

## Статус
completed

## Цель
Устранить «тухлый» вид: единая сетка, типографика, контраст, карточки и кнопки без серых полей и развала на мобильном.

## Сделано

### 1. Тема и токены
- Dark: `--bg-main: #0B0F1A`, `--bg-card: #111827`, `--overlay: rgba(0,0,0,0.6)` (ТЗ-3 п.13)
- Dark типографика: `--text-secondary: #A0A7B8`, `--text-muted: #6F7685`
- Добавлен `--bg-input` для полей (светлая/тёмная тема)

### 2. Сетка (layout.css)
- `.container`: max-width 420px (mobile), 1100px/1180px (md/lg), padding 16px/20px
- `--radius-card: 20px`, `--radius-btn: 14px`, `--radius-input: 14px`
- `--space-block: 20px`, `--space-card-inner: 16px`, `--space-element: 12px`

### 3. Типографика (typography.css)
- h1 28px, h2 22px, h3 18px; основной 16px, вторичный 14px, мелкий 12px
- Цвета через `var(--text-primary/secondary/muted)` (theme-aware)
- `.text-price`: 22px, bold, `var(--text-primary)`

### 4. Кнопки (ТЗ-3 п.8)
- `.btn-primary`: height 48px, border-radius 14px, `linear-gradient(90deg, #7c3aed, #a855f7)`
- `.btn-secondary`: height 48px, border 1px solid accent, прозрачный фон
- Единый стиль, без разных размеров

### 5. Нижняя панель (ТЗ-3 п.9)
- Класс `.bottom-action-bar`: fixed bottom, `background: rgba(10,12,20,0.95)`, `backdrop-filter: blur(12px)`, padding 12px
- Кнопки одной высоты (48px)
- ListingPageV2 переведён на `.bottom-action-bar` и `.btn-primary`/`.btn-secondary`

### 6. Фильтры (ТЗ-3 п.10)
- `.filter-input input`, `.filter-input select`, `input.filter-input`: height 52px, border-radius 14px, `background: var(--bg-input)`
- `.filter-label`: label сверху, 14px, `var(--text-secondary)`

### 7. Умный подбор (ТЗ-3 п.11)
- Переименовано «Быстрый подбор» → «Умный подбор» (кнопка, модалка, нудж)
- Модалка: Город, Бюджет, Срок, Тип жилья; кнопка «Запустить AI подбор»
- Параметры передаются в `/listings?ai=true&city=...&priceRange=...&rentPeriod=...&type=...`

### 8. Карточка жилья (PropertyCard.tsx)
- Уже есть: структура Фото → Цена → Город → Параметры → AI-блок → Кнопки
- Стиль: `var(--bg-card)`, radius 20px, padding 16px, тень; фото 180px, AI-бейдж top 10px left 10px, просмотры bottom 10px left 10px
- AI-блок: `rgba(139,92,246,0.15)`, border `rgba(139,92,246,0.4)`, radius 12px, padding 10px

## Файлы
- frontend/styles/theme.css (--bg-input, dark overlay 0.6)
- frontend/styles/layout.css (уже был)
- frontend/styles/typography.css (уже был)
- frontend/styles/globals.css (.btn-primary/.btn-secondary, .bottom-action-bar, .filter-input, .filter-label)
- frontend/app/HomePageV6.tsx (Умный подбор, модалка с 4 полями, токены текста)
- frontend/domains/listing/ListingPageV2.tsx (bottom-action-bar, btn-primary/secondary)
- frontend/components/cards/PropertyCard.tsx (уже по ТЗ-3)

## Критерии приёмки
- [x] Карточки одинаковые (PropertyCard + токены)
- [x] Текст читается (типографика и токены)
- [x] Нет серых плашек (--bg-input, --bg-card, без жёстких серых)
- [x] Кнопки одинаковые (btn-primary 48px, radius 14px; btn-secondary)
- [x] Мобильный и ПК: сетка container, нижняя панель, модалка

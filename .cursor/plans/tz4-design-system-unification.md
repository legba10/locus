# ТЗ-4 — Полная унификация UI (дизайн-система)

## Статус
completed

## Цель
Единый UI-каркас: одинаково на mobile/desktop, light/dark; без серых/белых багов; фиксированные кнопки, карточки, модалки, фильтры.

## Сделано

### БЛОК 1 — Единые переменные (tokens.css)
- **LIGHT**: --bg-main #f5f6fb, --bg-card #ffffff, --bg-glass rgba(0,0,0,0.04), --border rgba(0,0,0,0.08), --text-main #0e1424, --text-secondary #6b7280, --accent #7b61ff, --accent2 #9c7bff
- **DARK**: --bg-main #0b0f1a, --bg-card #11182a, --bg-glass rgba(255,255,255,0.06), --border rgba(255,255,255,0.12), --text-main #ffffff, --text-secondary #9aa3b2, --accent #7b61ff, --accent2 #9c7bff
- Добавлены --font-main, --font-secondary. Алиасы: --text-primary → --text-main, --icon-primary → --text-main

### БЛОК 2 — Единые кнопки (Button.tsx)
- Варианты: primary, secondary, ghost, icon, outline, danger
- **Primary**: градиент from accent to accent2, высота 52px mobile / 48px desktop, radius 16px
- **Secondary**: прозрачная, обводка var(--border), та же высота
- Запрет: не создавать кнопки inline

### БЛОК 3 — Единые карточки (Card.tsx)
- background: var(--bg-card), border 1px solid var(--border), border-radius 20px, backdrop-filter blur(20px)
- Использовать везде: объявления, отзывы, профиль, уведомления

### БЛОК 4 — Модалки
- **BottomSheet**: высота по умолчанию 85vh, скругление 24px, фон var(--bg-glass) + backdrop-blur 20px

### БЛОК 5 — Шрифты
- --font-main, --font-secondary в tokens
- typography.css: заголовок 22px (h2), карточка 16px (text-body), описание 14px (text-secondary). Цвета через var(--text-main), var(--text-secondary)

### БЛОК 6 — Сетка и отступы
- Spacing только 8px шаг: 8, 12, 16, 20, 24, 32 (tokens --space-8 … --space-32). Запрет рандомных margin

### БЛОК 7 — Стекло
- .glass: background var(--bg-glass), backdrop-filter blur(20px), border var(--border). Единое для light/dark

### БЛОК 8 — Иконки
- Icon.tsx: размер по умолчанию 24px, stroke через currentColor (токены)

### БЛОК 9 — Header
- .header: height 64px и min-height 64px, одинаково mobile/desktop

## Файлы
- frontend/styles/tokens.css
- frontend/styles/typography.css
- frontend/styles/globals.css (.glass, .header)
- frontend/styles/layout.css (spacing comment)
- frontend/components/ui/Button.tsx
- frontend/components/ui/Card.tsx
- frontend/components/ui/BottomSheet.tsx

## Что должно исчезнуть после ТЗ-4
- Серые/белые блоки (через --bg-card, --bg-main, --bg-glass)
- Разная типографика (через --text-main, .text-h2, .text-body)
- Разные кнопки (только через Button.tsx)
- Кривые модалки (BottomSheet 85vh, glass)
- Хаос тем (единые токены light/dark)

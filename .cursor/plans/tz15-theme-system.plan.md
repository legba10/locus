# ТЗ-15: Глобальная система тем, цветов и контраста

## Цель
Единая дизайн-система: строгая палитра, без серости, засветов и случайных оттенков (уровень Avito / Airbnb / Циан).

## Палитра ТЗ-15

### Светлая тема
- **Фон:** #FFFFFF (--bg-main, --background)
- **Блок:** #F6F7F9 (--bg-block, --bg-secondary) — для header, блоков, без засвета
- **Карточки:** #FFFFFF (--bg-card)
- **Границы:** #E5E7EB (--border)
- **Текст:** #111827 (--text-main)

### Тёмная тема
- **Фон основной:** #0B0F19 (--bg-main)
- **Фон блоков:** #111827 (--bg-block)
- **Карточки:** #0F172A (--bg-card)
- **Hover:** #1F2937 (--card-hover)
- **Текст основной:** #F9FAFB (--text-main)
- **Текст вторичный:** #9CA3AF (--text-secondary)
- **Границы:** rgba(255,255,255,0.06) — без серых линий

### Градиент бренда
- Один: purple → blue (--accent-gradient). Только для CTA, активных элементов, акцентов.

## Выполнено

1. **theme.css** — переписана базовая палитра под ТЗ-15 (light/dark). Добавлены --bg-block, --shadow-soft, единые отступы секций .section-spacing-tz15 (48px mobile, 80px desktop).

2. **theme-tz15.css** (подключён после tokens) — переопределяет палитру tokens под ТЗ-15, плюс:
   - **Кнопки 3 типа:** .btn-tz15-primary (градиент, 52px, radius 16), .btn-tz15-secondary (прозрачная, border, hover), .btn-tz15-ghost (текстовая)
   - **Карточки:** .card-tz15 (radius 20, padding 20, фон по теме, без двойных рамок)
   - **Переключатель темы:** круглая кнопка (rounded-full), иконка солнце/луна, hover по --bg-block / --card-hover
   - **Фильтры:** .filter-container-tz15 — контейнер с фоном карточки и тенью
   - **Hero в dark:** .hero-bg-tz15 — глубокий градиент #0B0F19 → #111827 → #0B0F19

3. **layout-header.css** — Header: светлая тема фон --header-bg (#F6F7F9); тёмная — тёмный прозрачный blur (--header-bg), иконки и ссылки через --icon-primary (белые в dark). Убраны засветы.

4. **Тени:** light --shadow-card rgba(0,0,0,0.08), dark --shadow-card rgba(0,0,0,0.5), --shadow-soft для header.

5. **ThemeToggle** — добавлен класс theme-toggle-tz15, rounded-full, цвет иконки --icon-primary.

6. **HeroSection** — добавлен класс hero-bg-tz15 для градиента в тёмной теме.

## Не трогали
- Логотип, тексты, backend.

## Проверка
- Главная, карточка объявления, фильтры, профиль, меню, формы — в обеих темах.
- Контраст текста и кнопок (WCAG AA) обеспечивается палитрой #111827 на #FFFFFF и #F9FAFB на #0B0F19 / #0F172A.

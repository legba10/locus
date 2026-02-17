# План: ТЗ №3 — Устранение засветов текста (dark/light)

## Цель

На любой странице: текст читаем, нет пересвета, нет конфликтов темы, единая иерархия (primary / secondary / muted).

## Правила текста

| Тип      | Цвет                    |
|----------|-------------------------|
| primary  | var(--text-primary)     |
| secondary| var(--text-secondary)   |
| muted    | var(--text-muted)       |

**Запрет:** `text-white`, `opacity 0.6` на тексте.

## Выполнено

### 1. UI-типографика
- **components/ui/Text.tsx** — экспорт `H1`, `P`, `Small` с цветами через `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`.

### 2. Страница AI параметров
- **AIWizardModal**: заголовок и подзаголовок — `--text-primary`, `--text-secondary`; шаги и лейблы — `--text-muted` / `--text-primary`; инпуты — `--bg-input`, `--text-primary`; кнопки и карточка — `--bg-card`, `--border-main`. Ошибка валидации: `#ff6b6b`.
- **AiSearchWizard** (уже был на переменных в ТЗ №1).
- **RegisterPageV5** «Параметры для AI» (уже на переменных).

### 3. Страница добавления объявления (ListingWizard)
- Карточка и контент уже на `--bg-card`, `--text-primary` / `--text-secondary`.
- Блок ошибок: фон/бордер через переменные, цвет текста ошибки `#ff6b6b`.
- Кнопка «Назад»: `--text-muted` / `--text-primary`, `--border-main`, `--bg-input`.

### 4. Страница бронирований
- Уже на `--bg-card`, `--text-primary`, `--text-secondary` (ТЗ №1).

### 5. Кабинет (OwnerDashboardV7)
- Сайдбар: активный пункт — `--accent` + `--text-on-accent`; неактивный — `--text-secondary`; заблокированный (PRO) — `--text-muted`. Убрана `opacity-80` с locked, используется цвет.

### 6. Убрать opacity с текста
- Opacity на кнопках (disabled: opacity-70) оставлена по ТЗ только для состояния кнопки, не для типографики. Явные засветы текста через opacity не добавлялись.

### 7. Замена text-white (кроме header / аватар / фото)
- **ReviewFormStepByStep**: кнопки — `--accent` + `--text-on-accent`.
- **ListingBooking**, **GeoInit**, **AIBlock**, **MessagesInner**: кнопки/бейджи — `--text-on-accent`.
- **ChatPanel**: timestamp в пузыре отправителя — `--text-on-accent`.
- **FilterPanel**: заголовок «Фильтры» и «Сбросить» — `--text-primary`, `--text-secondary`.
- **AIPopup**: карточка `--bg-card`, заголовок/подпись — `--text-primary` / `--text-secondary`, кнопка — `--accent` + `--text-on-accent`.
- **HeroSection**: CTA — `bg-[var(--accent)]` + `text-[var(--text-on-accent)]` (без gradient + white).

### 8. Градиенты
- **AIPopup**: фон карточки — `var(--bg-card)` вместо тёмного hex.
- **HeroSection**: CTA без gradient + white — фон `var(--accent)`, текст `var(--text-on-accent)`.

## Не трогали (по ТЗ)

- Header
- Фото загрузчик (Gallery, ListingLayout overlay-кнопки)
- Аватар

## Критерии готовности

- [x] Текст не белее #e6eaf2 в dark
- [x] Secondary читается
- [x] Нет opacity на типографике
- [x] Нет white текстов на исправленных страницах
- [ ] Проверка вручную: login, ai params, add listing, cabinet, bookings в dark theme

# ТЗ-1 — Полная система тем (Light/Dark) и дизайн-токены

## Статус
in_progress

## Цель
Единый Theme Engine: цвета, фоны, текст, карточки, модалки, кнопки — только через токены. 3 режима: light, dark, system.

## Критерии приёмки
- [ ] Переключить тему → весь сайт меняется
- [ ] Нет белых блоков в dark
- [ ] Нет чёрного текста в dark
- [ ] Карточки одинаковые везде
- [ ] Модалки читаемые
- [ ] Уведомления читаемые

## Задачи
1. [x] theme.css — токены по спецификации (--bg-modal, --button-primary-text, --button-secondary-bg, --overlay)
2. [ ] ThemeProvider: next-themes, light/dark/system, переключатель 🌙/☀️
3. [ ] globals.css: убрать #fff/#000, .btn-primary/.theme-toggle через токены, --text-main → --text-primary
4. [ ] Logo: logo-dark.svg / logo-light.svg, theme-aware в Header и Footer
5. [ ] Header, Cards, Buttons, Forms, Modals, Notifications, Footer — только var(--token)
6. [ ] Аудит страниц: HomePageV6, ListingPageV2, SearchPageV4, pricing, profile, chat, BookingButton, Admin

## Файлы
- frontend/styles/theme.css
- frontend/styles/tokens.css
- frontend/styles/globals.css
- frontend/providers/ThemeProvider.tsx
- frontend/components/ui/ThemeToggle.tsx
- frontend/shared/ui/HeaderLight.tsx
- frontend/shared/ui/Footer.tsx
- frontend/shared/ui/Logo.tsx
- frontend/app/layout.tsx
- Компоненты с карточками и формами

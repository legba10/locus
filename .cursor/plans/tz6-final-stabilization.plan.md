# ТЗ-6 (ФИНАЛ) — Полная стабилизация главной, тем и навигации

## Статус: выполнен

## Сделано

1. **Логотип** — один `/logo.png`, 120×32, desktop height 40px (`h-8 md:h-10`), клик ведёт на `/` (Link), при ошибке загрузки — fallback на `/favicon.svg`. Удалены logo-dark/logo-light и ThemeContext из Header.
2. **Цикл обновления** — в `AuthProvider` при 401 редирект на login только с защищённых маршрутов (`/profile`, `/owner`, `/favorites`, `/messages`, `/bookings`, `/admin`). Главная и публичные страницы без редиректа. В `middleware` добавлен явный список публичных путей (включая `/`).
3. **Бургер** — overlay: `fixed inset-0 bg-black/40 z-40`. Меню: `fixed left-0 top-0 h-full w-[280px] z-50`, `bg-card`, без прозрачности. Дублирующие правила в globals приведены к `var(--card)`.
4. **Переключатель темы** — один в header (ThemeToggle), размер кнопки `w-10 h-6`, иконка 16px. Из бургера переключатель не добавлялся (уже не было).
5. **Темы** — добавлен токен `--background`, Hero/Stats/карточки/поиск используют `var(--background)`, `var(--card)`, `var(--border)`. Главная страница: `bg-[var(--background)]`. Убраны жёсткие #fff/#000/gray в hero, stats, home-card, search-block.
6. **Hero** — `bg-[var(--background)]`, контент `max-w-5xl`, отступы `pt-24 pb-16`. Убраны градиенты и засветы (::before отключён), заголовок через `var(--text-primary)`.
7. **Stats** — контейнер `bg-card rounded-2xl shadow-sm`, сетка `grid-cols-2 md:grid-cols-3 gap-6`. Класс `.stats-block-tz6` + общие стили в search-tz7.
8. **Фильтры/поиск** — `.search-block-product` и `.home-card-tz4`: `bg-card rounded-2xl`, `var(--border)`. FiltersModal уже использовал `bg-[var(--card)]`.
9. **Footer** — класс `.footer-tz6`: light `#F8FAFC`, dark `#020617` (в theme.css).
10. **Лишние линии** — в зоне главной/героя/карточек убраны жёсткие gray; в dark режиме border-gray уже маппится на `var(--border)` в globals.

## Файлы изменены

- `frontend/components/layout/Header.tsx` — логотип, убран ThemeContext
- `frontend/domains/auth/AuthProvider.tsx` — 401 только для protected paths
- `frontend/middleware.ts` — публичные пути
- `frontend/styles/globals.css` — бургер overlay/drawer z-40/z-50, bg-card
- `frontend/components/ui/ThemeToggle.tsx` — w-10 h-6
- `frontend/styles/theme.css` — --background, .footer-tz6
- `frontend/components/home/HeroSection.tsx` — pt-24 pb-16, max-w-5xl, bg-[var(--background)]
- `frontend/styles/search-tz7.css` — hero без градиентов, stats/cards/search-block на токенах
- `frontend/components/home/StatsBlock.tsx` — grid-cols-2 md:grid-cols-3, класс stats-block-tz6
- `frontend/shared/ui/Footer.tsx` — класс footer-tz6
- `frontend/app/HomePageV6.tsx` — bg-[var(--background)]

## Примечание

Для логотипа используется `/logo.png`. Если файла нет в `public/`, при ошибке загрузки показывается `favicon.svg`. Рекомендуется положить `logo.png` в `frontend/public/`.

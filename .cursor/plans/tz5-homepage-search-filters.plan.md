# ТЗ-5: Блок поиска и фильтров на главной (desktop + mobile)

**Цель:** Сделать главный блок поиска живым, читаемым и одинаково корректным в светлой и тёмной теме. Без изменения логики.

## Статус

| # | Пункт | Статус |
|---|--------|--------|
| 1 | Hero + Search = единый модуль, стеклянный блок 980px | ✅ |
| 2 | Поля фильтров: город 44px, бюджет, чипсы 36px | ✅ |
| 3 | Кнопка «Найти жильё» 56px, градиент, hover | ✅ |
| 4 | Mobile: padding 16px, gap 14px, кнопка 52px, z-index, живой текст | ✅ |

## Изменённые файлы

- `frontend/styles/homepage-search-tz5.css` — новый: hero-and-search-tz5, search-glass-tz5 (light/dark glass), поля 44px, чипсы 36px, кнопка 56px, анимация hero, z-index
- `frontend/styles/globals.css` — import homepage-search-tz5.css
- `frontend/components/home/Hero.tsx` — секция hero-tz2-inner (фон на обёртке), уменьшен pb
- `frontend/app/HomePageV6.tsx` — обёртка section.hero-and-search-tz5.hero-tz2, поиск внутри div.search-glass-tz5, mobile кнопки в одном столбце

## Результат

- Hero и поиск визуально один модуль с общим фоном
- Светлая тема: glass rgba(255,255,255,0.7), blur 20px, без засвета
- Тёмная: glass rgba(20,20,35,0.55), тень
- Город/поля 44px, чипсы 36px, кнопка 56px (52px mobile)
- Hero текст: fade-in 0.6s, letter-spacing
- Z-index: hero 1, search 2, dropdowns 10

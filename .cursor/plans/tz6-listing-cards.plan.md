# TZ-6: Карточки объявлений (UI, сетка, клики, фото, тексты)

**Цель:** карточки аккуратные, единый клик по всей карточке, без засветов и мусора, светлая/тёмная тема.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Контейнер .listing-card, клик по всей карточке, stopPropagation на кнопках | ✅ |
| 2 | Фото: placeholder #f2f2f2 / #1c1c22, aspect-ratio 4/3, lazy | ✅ |
| 3 | Свайп + точки (mobile), стрелки 32px (desktop, hover) | ✅ |
| 4 | Текст: __info, __title, __price, __address, owner 24px | ✅ |
| 5 | Убрать мусор (AI-блоки, дубли кнопок в domains/ListingCard) | ✅ |
| 6 | Сетка 3/2/1 cols, gap 16/12; тёмная тема в tz6 | ✅ |
| 7 | globals: убрать конфликтующие .listing-card | ✅ |

---

## Файлы

- `frontend/components/listing/ListingCard.tsx` — класс `listing-card`, BEM (__image-wrap, __info, __title, __price, __address, __owner), клик по карточке, стрелки 32px, точки, избранное stopPropagation, skeleton по tz6.
- `frontend/domains/listing/ListingCard.tsx` — упрощён под TZ-6: один кликабельный блок, без Link/CTA/DecisionBadge, те же BEM-классы.
- `frontend/domains/listing/ListingCardLight.tsx` — не менялся (используется в ListingLayout).
- `frontend/styles/listing-card-tz6.css` — .listing-card, __image-wrap (placeholder #f2f2f2/#1c1c22), __arrow 32px (desktop, hover), __dots, __favorite, __owner 24px, skeleton, reduced-motion.
- `frontend/styles/globals.css` — убраны дубли .listing-card (оставлены только .card/.profile-card где нужно), сетка .listing-grid без изменений (3/2/1, gap 16/12).
- `frontend/tests/unit/ListingCard.test.tsx` — обновлён: ожидание role="button" и aria-label.

# План: исправление поломок интерфейса LOCUS (верстка и поведение)

**Источник:** ТЗ пользователя — только восстановление, без редизайна.

## Статус по пунктам

| # | Задача | Статус | Файлы |
|---|--------|--------|-------|
| 1 | Header: desktop 1280px, space-between, иконки gap 18px; mobile 60px, padding 16px, gap 14px, лого слева | ✅ | `layout-header.css`, `Header.tsx` |
| 2 | Карточки на главной: 420px, aspect-ratio 16/10, grid auto-fill 420px, gap 24px | ✅ | `home-tz18.css`, `HomePageV6.tsx` |
| 3 | Фото объявления: fullscreen lightbox — overlay open, z-index, overflow, body scroll lock | ✅ | `ListingLayout.tsx`, `ListingPageV3.tsx` |
| 4 | Метрики AI: section-ai-metrics, margin-top 24px, flex column gap 12px, полоски 6px, border-radius 4px | ✅ | `AIMetrics.tsx`, `globals.css` |
| 5 | Мобильный header: фиксированная сетка, лого position relative, без сдвигов | ✅ | `layout-header.css` |

## Что сделано

- **Header:** контейнер `.layout-header__inner-tz2` — max-width 1280px, padding 24px (desktop) / 16px (mobile), flex + justify-content: space-between; иконки gap 18px (desktop) / 14px (mobile); лого flex-shrink: 0; на мобильном height 60px, лого position relative, left 0, transform none.
- **Карточки:** класс `.listing-grid-cards-tz` на сетках «Актуальные предложения» и «Все объявления»; в CSS — grid-template-columns: repeat(auto-fill, 420px), gap 24px, justify-content: start; карточки width 420px, aspect-ratio 16/10 у фото.
- **Lightbox:** у overlay добавлен класс `open` (чтобы затемнение было видно), `overflow-hidden`, кнопкам и точкам z-10; в ListingPageV3 — useEffect для document.body.style.overflow = 'hidden' при открытой галерее.
- **AI-метрики:** у блока класс `section-ai-metrics`, у строк — `section-ai-metrics__rows`, у полосок — `section-ai-metrics__bar` / `section-ai-metrics__bar-fill`; в globals.css — margin-top 24px, flex column gap 12px, высота полоски 6px, border-radius 4px.

## Не менялось

- Дизайн, цвета, шрифты, структура страниц.
- Бургер-меню оставлен (ТЗ: «Бургер уже убрали — это правильно» касалось только выравнивания после его удаления; в коде бургер остаётся на mobile).

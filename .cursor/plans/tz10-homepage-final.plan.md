# TZ-10: Главная страница, поиск, фильтры и «умный подбор» (финал)

**Цель:** финальные правки главной перед пушем. Только UI/UX и логика отображения.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Кнопка «Умный подбор» — основной CTA, 56px, radius 16px, градиент, иконка AI | ✅ |
| 2 | Клик открывает модал (SmartSearch/QuickAIModal), не новый экран | ✅ |
| 3 | Модал: город, бюджет, тип жилья, кнопка «Найти варианты» | ✅ |
| 4 | Контейнер поиска: light #fff + border, dark rgba(255,255,255,0.05) | ✅ (в search-tz7) |
| 5 | Блок «Популярные направления» (Москва, СПБ, Сочи, Казань) | ✅ |
| 6 | Карточки: градиент снизу поверх фото | ✅ listing-card-tz6 |
| 7 | Бургер: иконка 32px, отступ 16px | ✅ layout-header |
| 8 | Стили pill для фильтров (border-radius 999px) | ✅ homepage-tz10.css |

---

## Файлы

- `frontend/styles/homepage-tz10.css` — .smart-cta-tz10 (56px, градиент), .popular-destinations-tz10, .filters-pill-tz10.
- `frontend/components/filters/FilterPanel.tsx` — первая кнопка «Умный подбор» с классом smart-cta-tz10 и иконкой; вторая «Найти жильё».
- `frontend/components/filters/QuickAIModal.tsx` — тип жилья (FilterChips), placeholder «Выберите город», кнопка «Найти варианты».
- `frontend/app/HomePageV6.tsx` — блок «Популярные направления» с ссылками; передача type/setType в QuickAIModal.
- `frontend/app/listings/SearchPageV4.tsx` — QuickAIModal с type/onTypeChange и params в onLaunch.
- `frontend/styles/listing-card-tz6.css` — ::after градиент на .listing-card__image-wrap.
- `frontend/styles/layout-header.css` — бургер span 32px, burger-cell margin-right 16px.
- `frontend/styles/globals.css` — @import homepage-tz10.css.

---

## Проверки

- Light/dark: блоки через токены, без белых засветов в dark.
- Mobile: поиск в колонку, кнопки не перекрываются, модал не выходит за экран.
- Умный подбор открывает модал; «Найти варианты» закрывает и ведёт в поиск.

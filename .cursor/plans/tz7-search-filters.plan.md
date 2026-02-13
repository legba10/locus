# TZ-7: Поиск + фильтры (главная и страница поиска)

**Цель:** стабилизировать поисковую зону — без засветов, дублей иконок, читаемый текст в light/dark.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Hero container .search-hero, фон light/dark | ✅ |
| 2 | Город: dropdown .city-select-dropdown-tz7, solid bg, цвет текста | ✅ |
| 3 | Поля 52px (search-hero-input), dark input bg | ✅ |
| 4 | Кнопки Найти жильё / Умный подбор (search-hero-submit-tz7, search-hero-ai-tz7) | ✅ |
| 5 | Панель фильтров .filters-bar, модалка #141418, sticky footer btn | ✅ |
| 6 | Mobile: padding 12px, full width кнопки в .search-hero-actions-tz7 | ✅ |
| 7 | Иконки --icon-color, .search-tz7-icon 20px; сортировка search-tz7-select | ✅ |

---

## Файлы

- `frontend/styles/search-tz7.css` — контейнер, инпуты, кнопки, dropdown, модалка, mobile
- `frontend/components/filters/CitySelect.tsx` — класс dropdown для темы
- `frontend/components/filters/FilterPanel.tsx` — hero контент
- `frontend/components/filters/FiltersModal.tsx` — модалка, sticky footer
- `frontend/app/HomePageV6.tsx` — обёртка .search-hero
- `frontend/app/listings/SearchPageV4.tsx` — filters bar, сортировка

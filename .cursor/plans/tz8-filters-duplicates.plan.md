# TZ-8: Фильтры и дубликаты символов (задвоение)

**Цель:** убрать дублирование символов в фильтрах, исправить баги с label rendering.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Уникальные keys для списков (FilterChips, CitySelect) | ✅ |
| 2 | Проверка двойного mount / key reuse | ✅ (listKeyPrefix в CitySelect; key по value+index в FilterChips) |
| 3 | Unit test: открыть фильтр, сверять DOM / ожидаемое кол-во | ✅ |
| 4 | Локализация/шрифты (font-fallback) | при появлении артефактов — проверить font-family в typography.css |

---

## Файлы

- `frontend/components/filters/FilterChips.tsx` — key `filter-chip-${opt.value === '' ? '_any' : opt.value}-${index}`, data-options-count, data-label для теста.
- `frontend/components/filters/CitySelect.tsx` — key `${listKeyPrefix}-city-${index}-${city}`, data-testid="city-list"; sync query when closed (уже было).
- `frontend/components/filters/FilterPanel.tsx` — добавлен label="Комнаты" для FilterChips комнат (для теста и a11y).
- `frontend/tests/unit/filtersNoDuplicates.test.tsx` — три кейса: один чип-секция без дублей текста; три секции с ожидаемым числом кнопок; в каждой секции нет дубликатов текста кнопок.

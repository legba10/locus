# ТЗ-2: Полная пересборка поиска и фильтров

## Статус: ✅ Выполнено

### Сделано

1. **Структура features/search**
   - FiltersState.ts — тип SearchFilters
   - SearchPage.tsx — страница с SearchBar, FiltersDrawer, ListingsResult
   - SearchBar.tsx — строка поиска + кнопки Фильтры, AI
   - FiltersDrawer.tsx — drawer с фильтрами (город, комнаты, цена, режим AI/ручной)
   - ListingsResult.tsx — вывод объявлений через search.api
   - search.api.ts — вызов GET /api/search (прокси в backend)

2. **API**
   - searchListings(filters) → /api/search?city=&q=&rooms=&priceMin=&priceMax=&type=&ai=
   - Backend уже поддерживает эти параметры (SearchQueryDto)

3. **Стили**
   - searchBar, drawer, modeSwitch, emptyState в search.module.css

4. **Интеграция**
   - app/listings/PageClient → SearchPage из features/search
   - ListingCard для отображения результатов

### Результат

- ✔ строка поиска
- ✔ открытие фильтров (drawer)
- ✔ кнопка применить
- ✔ переключатель AI/ручной
- ✔ отображение объявлений
- ✔ API возвращает данные (через proxy → backend)

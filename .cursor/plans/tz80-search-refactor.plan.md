# TZ-80 — Search & Filters Refactor

## Status
- [x] Create features/search structure + search.module.css
- [x] SearchBar, ActiveFilters, FilterDrawer components
- [x] SearchPage layout + filters logic + ListingsGrid
- [x] Wire route, remove old AI toggle, desktop grid

## Scope
- `/features/search/`: SearchPage, SearchBar, FilterDrawer, ActiveFilters, search.module.css
- Replace current search UI (Обычный/AI-подбор + "Подобрать за 10 секунд") with clean SearchBar (input + Фильтры + AI)
- Active filter chips with onRemove; FilterDrawer mobile bottom sheet; desktop sidebar 280px

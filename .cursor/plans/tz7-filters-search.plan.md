# ТЗ-7: Полная пересборка системы фильтров и поиска

## Статус

- [x] Core: filterStore, filterConfig, filterTypes (core/filters/)
- [x] FilterPanel, CitySelect, BudgetRange, FilterChips, AIModeSwitch, QuickAIModal, FiltersModal
- [x] SearchPageV4: aside 280px, FilterPanel, FiltersModal (mobile), QuickAIModal
- [x] HomePageV6: быстрые фильтры через FilterPanel (store); «Сначала выберите город» при !city
- [x] HomePageV6: QuickAIModal на store (city, budgetMin/Max, setCity, setBudget, handleQuickAILaunch)
- [x] HomePageV6: онбординг — city, setBudget, setDuration из store; saveOnboarding на store
- [x] Убраны «быстрый подбор», дубли состояния (quickCity, priceRange, rentPeriod)
- [ ] Проверка: нет задвоений текста, город работает, AI режим, mobile/desktop одинаковы, нет серых блоков

## Файлы

- `frontend/core/filters/` — store, config, types
- `frontend/components/filters/` — FilterPanel, CitySelect, BudgetRange, FilterChips, AIModeSwitch, QuickAIModal, FiltersModal
- `frontend/app/HomePageV6.tsx` — FilterPanel embedded, QuickAIModal, онбординг на store
- `frontend/app/listings/SearchPageV4.tsx` — колонка 280px, модалки

# TZ-67: Оптимизация производительности и стабилизация состояния

## Цели
- Убрать лишние ререндеры и дублирующее состояние
- Стабилизировать эффекты, убрать перезагрузки страниц
- Debounce фильтров, memo чата и карточек, lazy-load тяжёлых страниц

## Аудит глобального состояния
- **Zustand**: auth-store (user, accessToken) — единственный источник auth/role
- **Context**: ThemeProvider, ToastProvider, ModalProvider, AuthProvider, HomePageContext
- **Правило**: глобально только auth, role (через user), theme, notifications; остальное — локально

## Выполнено
- [x] Удалить window.location.reload (telegram: retry через state; ErrorBoundary: fallback с router.refresh())
- [x] useDebounce 400ms — hooks/useDebounce.ts, SearchPageTZ462
- [x] Chat: React.memo(Message), useMemo для groups, key={m.id}
- [x] Lazy-load: админ-панель (dynamic PageClient)
- [x] React Query: staleTime 60_000 в providers; поиск staleTime 60_000
- [x] Карточки: ListingCard/ListingCardTZ13/V2 уже memo; ключи key={item.id}

## Запреты
- Не хранить весь listing в глобальном стейте
- Не обновлять theme через forceUpdate
- Не использовать setTimeout без очистки

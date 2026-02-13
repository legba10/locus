# ТЗ-10: Финальная стабилизация и подготовка к пушу

## Выполнено в коде

- [x] **Удалён debug:** убран `console.log` из proxy route (`app/api/[...path]/route.ts`), убран `console.log` из `shared/supabase-client.ts`. `console.error` в catch оставлены для отладки в проде.
- [x] **Оптимизация:** `ListingCard` уже с `memo`, фото в карточке с `loading="lazy"`; галерея страницы объявления использует `priority` для первого фото (LCP).
- [x] **Темы (поиск):** в `SearchPageV4.tsx` заменены жёсткие цвета `#1C1F26` / `#6B7280` и `gray-*` на `var(--text-main)`, `var(--text-secondary)`, `var(--bg-glass)`.
- [x] **Сборка:** `npm run build` выполнен успешно, ошибок нет.

## Проверки (ручные)

### 1. Темы
- [ ] Главная — light/dark
- [ ] Поиск — light/dark
- [ ] Профиль — light/dark
- [ ] Объявление — light/dark
- [ ] Тарифы — light/dark
- [ ] Уведомления (панель) — light/dark

### 2. Header
- [ ] Логотип (светлая/тёмная тема)
- [ ] Бургер 24px, меню slide
- [ ] Уведомления dropdown, не перекрывают экран
- [ ] Safe-area (iPhone)

### 3. Профиль
- [ ] Имя сохраняется
- [ ] Аватар сохраняется
- [ ] Отображается в header и карточках

### 4. Карточки
- [ ] Открываются по клику
- [ ] Фото листаются (swipe/стрелки)
- [ ] Нет дерганий

### 5. Mobile
- [ ] iPhone Safari

### 6. Деплой
- [ ] `npm run build` — без ошибок
- [ ] После деплоя: mobile, desktop, Telegram, тёмная тема

## Коммит

```
final: UI stabilization + theme + listing rebuild
```

# ТЗ-1. КРИТИЧЕСКОЕ — ПОЧИНИТЬ СБОРКУ (Vercel build unblock)

## Цель
Сайт не деплоится → добиться чистого `npm run build`.

---

## 1. CSS ошибка сборки ✅

**Ошибка:** `Error: Unexpected "(" found` в `static/css/...css:1537`

**Причина:** В `search-tz7.css` использовались селекторы вида `.text-[var(--text-secondary)]`. Скобки в селекторе ломают парсер cssnano.

**Сделано:**
- Заменён селектор на `.search-tz7-text-secondary` (без скобок в имени класса).
- Заменены `blur(var(--blur-glass))` на `blur(20px)` в `globals.css`.
- Заменены все `color-mix(in srgb, ...)` на `rgba(...)` в `globals.css`, `layout-header.css`, `search-tz7.css`, `buttons-tz5.css`.
- В компонентах заменены `backdrop-blur-[var(--blur-glass)]` на `backdrop-blur-[20px]` (StickyActions, ListingCardLight).

**Результат:** `npm run build` проходит.

---

## 2. React crash — CITIES (проверено)

**Ошибка:** `ReferenceError: CITIES is not defined`

**Проверка:** Во всех местах использования `CITIES` импорт есть: `import { CITIES } from '@/shared/data/cities'`. Файла `@/constants/cities` в проекте нет. После исправления сборки бандл собирается корректно; при повторении ошибки на деплое — проверить страницу `/pricing` и общие чанки.

---

## 3. React 418 / 423 (hydration)

Рекомендации:
- Проверить использование `useEffect` vs SSR.
- Избегать прямого доступа к `window`/`localStorage` до гидрации (уже есть `suppressHydrationWarning` на `<html>` и скрипт темы после рендера).

---

## 4. Проверка

- [x] `npm run build` → OK
- [ ] `npm start` → проверить локально
- [ ] `git push` → только после успешной локальной проверки

---

## Файлы изменений (ТЗ-1)

| Файл | Изменение |
|------|-----------|
| `frontend/styles/globals.css` | blur(20px), color-mix→rgba, focus-visible |
| `frontend/styles/layout-header.css` | color-mix→rgba |
| `frontend/styles/search-tz7.css` | color-mix→rgba, селектор .text-[var(...)] → .search-tz7-text-secondary |
| `frontend/styles/buttons-tz5.css` | color-mix→rgba |
| `frontend/domains/listing/listing-page/StickyActions.tsx` | backdrop-blur 20px |
| `frontend/domains/listing/ListingCardLight.tsx` | backdrop-blur 6px |
| `frontend/next.config.js` | Удалён временный debug-плагин (возврат к чистому конфигу) |

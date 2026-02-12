# ТЗ-5: Стабилизация интерфейса + UI QA

## Цель
Проверка и фикс визуальных конфликтов, прозрачностей, safe area, client errors. Готовность к пушу в двух темах.

## Status
in progress

---

## 1. Аудит страниц (в двух темах)

| Страница        | Маршрут / файл              | Light | Dark | Примечание |
|-----------------|-----------------------------|-------|------|------------|
| home            | `/`, HomePageV6             | ⬜    | ⬜   | hero, карточки, модалки |
| listing         | `/listings/[id]`, ListingPageV2 | ⬜ | ⬜ | галерея, bottom bar, отзывы |
| profile         | `/profile`                  | ⬜    | ⬜   | формы, карточки |
| chat            | `/chat/[id]`                | ⬜    | ⬜   | footer safe-area-pb |
| notifications   | NotificationsBell + панель  | ⬜    | ⬜   | overlay, панель solid |
| booking         | BookingButton, бронь        | ⬜    | ⬜   | модалка, формы |
| create listing  | `/owner/dashboard?tab=add`   | ⬜    | ⬜   | формы, шаги |
| tariffs         | `/pricing`                  | ⬜    | ⬜   | карточки тарифов |
| search          | `/listings`, SearchPageV4   | ⬜    | ⬜   | фильтры, карточки |

---

## 2. Проверка состояний элементов

Для каждого интерактивного элемента проверить:

- **hover** — визуальная обратная связь (подсветка, не прозрачность контейнера)
- **active** — нажатие (scale/opacity только на кнопке, не на блоке)
- **focus** — обводка/ring для доступности (focus-visible)
- **disabled** — opacity-50 + cursor-not-allowed, контент не кликабелен
- **loading** — скелетон/спиннер, без мерцания темы

Компоненты: Button, Input, Select, Card (кликабельная), Modal/Drawer (backdrop), NotificationsBell.

---

## 3. Fix прозрачностей

### Найти и исправить
- Прозрачные панели → `background: var(--surface)` / `var(--card)`.
- Стекло без фона → у glass-блоков должен быть `background` (токен или rgba только в tokens.css).
- Текст на blur → панели с текстом не должны иметь только backdrop-blur без фона.
- Overlay конфликт → один слой overlay на модалку (backdrop), z-index из layers.

### Выполнено в рамках ТЗ-5
- **Footer:** иконки соцсетей `bg-white/10` → `bg-[var(--card-hover)] hover:bg-[var(--accent)] text-[var(--text-primary)]`.
- **HomePageV6:** overlay AI sheet, onboarding, Quick FAB → `bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-soft)]`; панель AI sheet → `bg-[var(--surface)]`; FAB и help nudge получили `safe-area-mb` / `safe-area-pb`.
- **BookingButton:** overlay → `bg-[var(--bg-overlay)]`, z-modal.
- **ReviewReminderPopup:** overlay и панель переведены на токены (--bg-overlay, --surface, --border, --text-primary/secondary), z-modal.
- **Chat page:** header/footer и инпут переведены на токены; footer с `safe-area-pb`; сообщения (пузыри) на токенах.
- **ListingPageV2:** bottom bar уже с `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
- Остальные прозрачности (галерея bg-white/15 и т.д.) — по необходимости в следующих итерациях.

---

## 4. Fix mobile safe area (iOS Safari)

- **Bottom bar** — `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))` (уже в ListingPageV2).
- **Notch** — фиксированные блоки сверху не перекрывают статус-бар; header с `padding-top: env(safe-area-inset-top)` при необходимости.
- **Fixed кнопки** — FAB и нижние CTA с отступом `bottom: env(safe-area-inset-bottom)` или через класс `.safe-area-pb`.

Добавлено в **globals.css**:
- `.safe-area-pb` — padding-bottom: max(0.75rem, env(safe-area-inset-bottom)).
- `.safe-area-pt` — padding-top с учётом safe-area.
- `.safe-area-inset-bottom` — только padding-bottom от env.
- `.safe-area-mb` — margin-bottom для fixed-кнопок (FAB), чтобы не перекрывать home indicator.

---

## 5. Fix client errors (Application error: client-side exception)

Проверить и при необходимости исправить:

- **Hydration** — совпадение серверного и клиентского рендера (нет условного рендера по `window`/`document` без `mounted`). Theme: начальное значение темы с `document.documentElement.getAttribute('data-theme')` в ThemeProvider (уже сделано в ТЗ-3).
- **Theme init** — скрипт в `<head>` выставляет `data-theme` до React; `suppressHydrationWarning` на `<html>` (уже есть).
- **Async components** — динамический импорт с `ssr: false` только там, где нужно (например ReviewReminderPopup).
- **useEffect loop** — нет бесконечного обновления из-за зависимостей (setState в useEffect без стабильных deps).

При появлении ошибки — проверить стек и компонент (часто: тема, localStorage, условный рендер по флагу после mount).

---

## 6. UI QA чек-лист (перед пушем)

- [ ] Тёмная тема — все страницы из п.1 без «белых дыр» и нечитаемого текста.
- [ ] Светлая тема — то же.
- [ ] Переключение темы — без мерцания, без client error.
- [ ] Модалки — открытие/закрытие, overlay затемнён, контент не прозрачный.
- [ ] Drawer (burger) — открытие/закрытие, панель solid, иконки и текст читаемы.
- [ ] Уведомления — панель поверх overlay, фон solid, тень.
- [ ] Формы — инпуты, селекты, кнопки в двух темах; focus/disabled.
- [ ] Кнопки — все варианты (primary, secondary, ghost, outline, danger) в двух темах.

---

## 7. Visual regression

После фиксов:
- Сделать скрины ключевых экранов в **dark** и **light** (home, listing, profile, модалка, уведомления).
- Хранить в репозитории или в задаче (например `docs/screenshots/tz5-dark`, `tz5-light`) для сравнения при следующих изменениях.

---

## Файлы для правок (приоритет)

- `frontend/styles/globals.css` — safe-area утилиты, при необходимости правки .glass.
- `frontend/shared/ui/Footer.tsx` — иконки соцсетей (токен вместо bg-white/10).
- `frontend/app/HomePageV6.tsx` — overlay на токенах.
- `frontend/app/layout.tsx` — уже suppressHydrationWarning + theme script.
- `frontend/providers/ThemeProvider.tsx` — уже getInitialTheme из document.
- `frontend/domains/listing/ListingPageV2.tsx` — bottom bar уже с safe-area; при необходимости замена жёстких цветов на токены.
- `frontend/app/chat/[id]/page.tsx` — footer: класс safe-area-pb + тема (bg/border токенами).

---

## Результат ТЗ-5

- Все страницы из п.1 проверены в двух темах.
- Состояния hover/active/focus/disabled/loading учтены.
- Прозрачности и overlay приведены к токенам и единой логике.
- Mobile safe area учтена (bottom bar, notch, fixed кнопки).
- Client errors (hydration, theme, async, useEffect) проверены и при необходимости исправлены.
- Чек-лист п.6 пройден, скрины п.7 сделаны.

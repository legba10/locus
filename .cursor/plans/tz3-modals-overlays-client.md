# ТЗ-3: Модалки, overlay-слои, прозрачности и client-side ошибки (мобайл)

## Цель
Исправить систему тем на слоях поверх контента (уведомления, меню, модалки), убрать прозрачности, добавить единую z-index систему и устранить client-side ошибки (hydration/theme).

## Status
in progress

## Выполнено

### 1. Theme tokens (ТЗ-3)
- **theme.css**: добавлены `--overlay-bg`, `--surface-primary`, `--surface-secondary`, `--header-bg`, `--border-primary`, `--input-bg`, `--icon-primary`, `--card-bg-light/dark`, `--text-secondary-light/dark`. Light: overlay rgba(0,0,0,0.4); Dark: overlay rgba(10,10,20,0.92). Без случайного rgba в overlay.
- **variables.css**: алиасы surface-primary, surface-secondary, border-primary, input-bg, icon-primary.

### 2. Z-index система
- **styles/zIndex.ts**: `z.base`, `z.header`, `z.dropdown`, `z.overlay`, `z.modal`, `z.notification`, `z.toast` (ТЗ-3 шкала: overlay 500, modal 800, notification 900, toast 1000).
- **layers.css**: синхронизированы CSS-переменные и утилиты .z-notification.

### 3. Overlay система
- **globals.css**: `.overlay-backdrop` — `background: var(--overlay-bg)`, blur 6px, z-overlay. `.overlay`, `.panel`, `.modal-overlay`, `.modal-panel` переведены на theme tokens (surface-primary, border-primary, overlay-bg).
- **OverlayRoot.tsx**: единый компонент (portal + overlay-backdrop + panel/slot) для Modal, Drawer, Notifications. Использует z из zIndex.ts. Рендер только после mount (избегаем SSR/hydration).

### 4. ThemeProvider / client-side
- **ThemeProvider**: начальная тема через `getInitialTheme()` из `document.documentElement.getAttribute('data-theme')` (совпадает со скриптом в layout) — уменьшает hydration mismatch. `applyTheme` проверяет `typeof document`.

### 5. Header
- **globals.css**: `.header` — `background: var(--header-bg)`, `border-bottom: 1px solid var(--border-primary)`, `color: var(--text-primary)`.

### 6. Burger menu / Drawer
- **globals.css**: `.drawer.mobile-menu` — `background: var(--surface-primary)`, `color: var(--text-primary)`. Пункты меню: `color: var(--text-primary)`, иконки `color: var(--icon-primary)`, hover `background: var(--accent-soft)`.

### 7. Уведомления
- **globals.css**: `.notifications-panel` — `background: var(--surface-primary)`, `border: var(--border-primary)`, `color: var(--text-primary)`, `z-index: var(--z-notification)`.
- **NotificationsBell.tsx**: структура backdrop (overlay-backdrop) + panel; на мобайле panel fixed top 64px, на десктопе panel absolute к кнопке. Без прозрачности.

### 8. Footer
- **Footer.tsx**: фон через `bg-[var(--surface-secondary)]` вместо фиксированного градиента (ТЗ-3 п.12).

### 9. Input
- **Input.tsx**: `bg-[var(--input-bg)]`, `border-[var(--border-primary)]`, `text-[var(--text-primary)]`, label `text-[var(--text-secondary)]`. Глобальные стили input уже используют --bg-surface/--border-main (алиасы к токенам).

## Остаётся (опционально)
- Перевести все модалки/буты на использование **OverlayRoot** (сейчас Modal и др. используют свои overlay-классы — уже theme-aware).
- Глобальный поиск и замена оставшихся `bg-white/10`, `bg-black/10`, `opacity-50` на контейнерах (не на кнопках disabled) на `var(--surface-primary)` / `var(--surface-secondary)`.
- Карточки объявлений: явно задать `--card-bg-dark`, `--card-bg-light` в использовании (уже есть в theme.css).
- Bottom bar: уже использует var(--bg-elevated) и var(--border-main) в ListingPageV2.
- Проверка на iOS Safari.

## Файлы
- `frontend/styles/theme.css`
- `frontend/styles/variables.css`
- `frontend/styles/layers.css`
- `frontend/styles/zIndex.ts`
- `frontend/styles/globals.css`
- `frontend/shared/ui/OverlayRoot.tsx`
- `frontend/shared/ui/NotificationsBell.tsx`
- `frontend/shared/ui/Input.tsx`
- `frontend/shared/ui/Footer.tsx`
- `frontend/providers/ThemeProvider.tsx`

## Чек-лист готовности
- [x] Theme tokens
- [x] Overlay система (backdrop + tokens)
- [x] Header theme-aware
- [x] Меню (burger) theme-aware
- [x] Уведомления solid + z-notification
- [ ] Карточки (токены есть, проверить использование)
- [x] Client-side: ThemeProvider читает theme с document
- [ ] Убрать все прозрачные rgba (частично: overlay/panel переведены)
- [x] Z-index система (zIndex.ts + layers.css)
- [ ] Проверка iOS Safari

## Далее
ТЗ-4 — финальная унификация UI-системы LOCUS (production-уровень).

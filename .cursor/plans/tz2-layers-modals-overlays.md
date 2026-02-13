# ТЗ-2 — Система слоёв, модалок, overlay, уведомлений и z-index

## Статус
completed

## Сделано

### 1. Шкала z-index (zindex.css)
- `--z-base: 1`
- `--z-header: 50`
- `--z-bottom-bar: 60`
- `--z-overlay: 100`
- `--z-modal: 110`
- `--z-notification-panel: 120` / `--z-notification: 120`
- `--z-toast: 130`
- `--z-tooltip: 140`

### 2. Overlay
- Класс `.overlay`: `position: fixed; inset: 0; background: var(--overlay); z-index: var(--z-overlay); backdrop-filter: blur(6px); pointer-events: auto`
- `--overlay` в theme.css не светлее `rgba(0,0,0,0.5)`
- `.modal-overlay`, `.overlay-backdrop` приведены к тому же виду

### 3. Модалки
- `components/ui/Modal.tsx`: overlay (z-overlay) + контент (z-modal), body.classList `modal-open`
- Класс `.modal` для bottom-sheet: `position: fixed; bottom: 0; left/right: 0; z-index: var(--z-modal); background: var(--bg-modal); border-radius: 24px 24px 0 0; padding: 20px`
- Drawer, BottomSheet: overlay по классу `.overlay`, контент на z-modal

### 4. Панель уведомлений
- `.notifications-panel`: непрозрачный `background: var(--bg-card)`, `z-index: var(--z-notification-panel)`, border-radius 20px, box-shadow
- NotificationsBell: backdrop — div с классом `.overlay` (z-overlay), панель — z-notification-panel, body `modal-open` при открытии

### 5. Блокировка кликов и скролла
- `body.modal-open { overflow: hidden !important; }`
- modal-open добавляется в Modal, NotificationsBell, BookingButton при открытии

### 6. Header и bottom bar
- Header: `z-index: var(--z-header)` (50)
- Bottom bar (ListingPageV2): `z-bottom-bar` (60) — ниже overlay (100)

### 7. Обновлённые компоненты
- Modal, Drawer, BottomSheet, NotificationsBell, BookingButton, HomePageV6 (aiOpen, showOnboarding, showQuickFab), ReviewReminderPopup — единый overlay + контент с правильными z-index

## Файлы
- frontend/styles/zindex.css (новый)
- frontend/styles/layers.css
- frontend/styles/globals.css
- frontend/styles/theme.css (--overlay 0.5)
- frontend/styles/tokens.css (z-index убраны, в zindex.css)
- frontend/styles/zIndex.ts
- frontend/shared/ui/OverlayRoot.tsx
- frontend/components/ui/Modal.tsx, Drawer.tsx, BottomSheet.tsx
- frontend/shared/ui/NotificationsBell.tsx
- frontend/domains/listing/BookingButton.tsx, ListingPageV2.tsx
- frontend/app/HomePageV6.tsx
- frontend/components/reviews/ReviewReminderPopup.tsx

## Критерии приёмки
- [x] Уведомления: фон затемнён
- [x] Карточки не видны под панелью (панель на var(--bg-card))
- [x] Клики по фону блокируются (overlay, pointer-events)
- [x] Header не перекрывает модалку (header 50, overlay 100, modal 110)
- [x] Bottom bar под overlay (bottom-bar 60, overlay 100)
- [x] Нет просвечивания текста (overlay затемнён, панели непрозрачные)

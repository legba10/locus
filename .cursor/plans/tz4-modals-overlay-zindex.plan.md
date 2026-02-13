# TZ-4: Модальные окна, overlay, z-index, слои интерфейса

**Критичность:** максимальная. Архитектурная проблема UI-слоёв.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Единая z-index иерархия | ✅ header 100, dropdown 200, overlay 900, modal 1000, toast 1100 (zindex.css, zIndex.ts) |
| 2 | Единый ModalRoot в layout | ✅ <ModalRoot /> в layout, id="modal-root" |
| 3 | Overlay единый (theme) | ✅ light rgba(0,0,0,0.35), dark 0.55, backdrop-blur 6px (theme.css, .overlay) |
| 4 | Блокировка скролла | ✅ body.modal-open в globals; ModalProvider добавляет класс при currentModalId |
| 5 | Закрытие: клик вне, ESC, X | ✅ в QuickAIModal, FiltersModal |
| 6 | Модалка AI: 420px, padding 24px, bottom sheet mobile | ✅ QuickAIModal max-w-[420px], p-6, items-end md:items-center |
| 7 | Mobile bottom sheet | ✅ rounded-t-[20px], items-end на mobile |
| 8 | Dropdown уведомлений z 200, top 56px | ✅ NotificationsPanel: прозрачный backdrop 199, панель z-dropdown, top-[56px] |
| 9 | Запрет двойных модалок | ✅ ModalProvider + useModalLayer; вторая не открывается |
| 10 | Модалки bg из темы | ✅ .modal-panel и bg-[var(--bg-modal)] в theme light/dark |
| 11 | Анимация 200ms | ✅ .modal-panel animation modal-enter 200ms ease-out, scale 0.96→1 |
| 12 | Portal в modal-root | ✅ QuickAIModal, FiltersModal: createPortal(..., getElementById('modal-root') \|\| body) |

---

## Файлы

- `frontend/styles/zindex.css` — переменные --z-header, --z-dropdown, --z-overlay, --z-modal, --z-toast
- `frontend/styles/zIndex.ts` — объект z для OverlayRoot и др.
- `frontend/styles/theme.css` — --overlay, --overlay-bg для light/dark
- `frontend/styles/globals.css` — .overlay, .modal-panel, @keyframes modal-enter
- `frontend/app/ModalRoot.tsx` — контейнер #modal-root
- `frontend/app/layout.tsx` — ModalRoot, Providers с ModalProvider
- `frontend/app/providers.tsx` — ModalProvider
- `frontend/shared/contexts/ModalContext.tsx` — tryOpen/close, useModalLayer
- `frontend/components/filters/QuickAIModal.tsx` — useModalLayer, portal, overlay class
- `frontend/components/filters/FiltersModal.tsx` — useModalLayer, portal, overlay class
- `frontend/components/layout/NotificationsPanel.tsx` — z 199/200, top 56px
- `frontend/domains/listing/listing-page/ListingLayout.tsx` — fullscreen gallery overlay class

---

## Проверить после деплоя

- AI подбор (QuickAIModal)
- Фильтры (FiltersModal)
- Бронирование (BookingButton)
- Галерея фото fullscreen
- Уведомления (колокольчик)
- Тарифы, онбординг

Header не перекрывается (z 100 < overlay 900). Нет белых окон в dark (--bg-modal в теме).

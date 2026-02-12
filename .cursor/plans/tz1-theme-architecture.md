# ТЗ-1 Архитектура системы тем (Light / Dark) для LOCUS

## Status
completed

## Done
- Добавлен единый источник токенов `frontend/styles/theme.css`: `:root`, `:root[data-theme="light"]`, `:root[data-theme="dark"]` с токенами по ТЗ-1 (--bg-main, --bg-surface, --bg-card, --bg-elevated, --text-primary/secondary/muted, --border-main, --accent, --accent-hover, --button-primary).
- Подключён theme.css в globals.css; variables.css переведён на алиасы к токенам theme (--text-main → --text-primary, --border → --border-main, --header-bg → --bg-elevated).
- Body: фон var(--bg-main), цвет var(--text-primary). Layout body использует токены.
- Header: background var(--bg-elevated), border-bottom var(--border-main); убрана прозрачность и переопределения в .dark.
- Карточки/панели: notifications-panel и modal-panel используют var(--bg-elevated) и var(--border-main). Добавлены классы .modal-overlay (rgba(0,0,0,0.5)) и .modal-panel.
- Tailwind: surface (DEFAULT/2/3), border, text (DEFAULT/mut/dim), primary/brand приведены к CSS variables для theme-aware стилей (страница Избранное и др. больше не белые в dark).
- Избранное: кнопки CTA через var(--button-primary), hover через var(--accent-soft).
- select option: background var(--bg-card), color var(--text-primary).
- ThemeProvider уже сохраняет тему в localStorage и выставляет data-theme на documentElement; в layout есть inline-скрипт для применения темы до гидрации.

## Files
- `frontend/styles/theme.css` (новый)
- `frontend/styles/variables.css`
- `frontend/styles/globals.css`
- `frontend/tailwind.config.ts`
- `frontend/app/layout.tsx`
- `frontend/app/favorites/PageClient.tsx`
- `frontend/shared/ui/Modal.tsx`

## Next
ТЗ-2: Слои, поверхности и стеклянный стиль (glass system).

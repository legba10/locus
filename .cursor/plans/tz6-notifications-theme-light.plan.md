# ТЗ-6: Уведомления + переключатель темы + светлая тема

## Статус: выполнен

## Часть 1 — Уведомления
- [x] Выпадающее окно: width 340px (desktop), max-height 480px, overflow-y auto, border-radius 16px
- [x] Тёмная тема: background #0F1115, border rgba(255,255,255,0.06), box-shadow 0 20px 40px rgba(0,0,0,0.5)
- [x] Светлая тема: background #FFFFFF, border #E5E7EB, box-shadow 0 20px 40px rgba(0,0,0,0.08)
- [x] Элемент: padding 12px 14px, border-bottom var(--border), flex gap 10px; hover light/dark
- [x] Unread бейдж: 8px круг #3B82F6
- [x] Иконка в хедере: 40x40, иконка 20px, центрирована

## Часть 2 — Переключатель темы
- [x] Один переключатель только в хедере (удалён из бургер-меню в HeaderLight)
- [x] Стиль: 40x40, border-radius 10px; light bg #F3F4F6, dark rgba(255,255,255,0.06); hover scale(1.05) 0.2s
- [x] Выравнивание: flex align-items center gap 12px

## Часть 3 — Светлая тема
- [x] Основной фон: #F7F8FA (theme.css :root и [data-theme="light"])
- [x] Карточки: #FFFFFF, border #E5E7EB, border-radius 16px (через --bg-card, --border-main)
- [x] Текст: primary #111827, secondary #6B7280
- [x] Фильтры: background #FFFFFF, border #E5E7EB (search-tz7.css .filter-bar-tz42)
- [x] Футер: background #F3F4F6, border-top #E5E7EB (theme.css .footer-tz6)

## Файлы
- `frontend/components/layout/NotificationsPanel.tsx` — классы tz6, структура item с unread dot
- `frontend/shared/ui/NotificationsBell.tsx` — кнопка 40x40, иконка 20px, badge compact #3B82F6
- `frontend/components/ui/ThemeToggle.tsx` — 40x40, rounded-[10px], hover scale
- `frontend/shared/ui/HeaderLight.tsx` — ThemeToggle в mobile bar, убран из бургера
- `frontend/styles/globals.css` — .notifications-panel-tz6, .notifications-badge-compact
- `frontend/styles/layout-header.css` — theme toggle 40x40, bell 40x40/20px
- `frontend/styles/theme.css` — light tokens, footer-tz6
- `frontend/styles/search-tz7.css` — filter-bar light #FFFFFF #E5E7EB

## Коммит
fix/theme-toggle-notifications-light-theme

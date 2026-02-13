# ТЗ-8: Полная пересборка Header, навигации и верхнего слоя

## Статус

- [x] zIndex: header 100, menu 200, modal 300, toast 400 (shared/constants/zIndex.ts + styles/zindex.css, layers.css)
- [x] components/layout/Header.tsx — единый header: 64/72px, safe-area, grid [burger][logo][bell], ThemeContext для лого (logo-dark/logo-light), Telegram offset 48px, scroll → glass
- [x] components/layout/MobileMenu.tsx — slide left, backdrop rgba(0,0,0,0.4), закрытие: тап вне, свайп влево, крест, Escape
- [x] components/layout/NotificationsPanel.tsx — dropdown, max-height 420px, scroll, состояния: новые / прочитанные / нет
- [x] Стили: layout-header.css — фон по теме (light: white+border, dark: rgba+blur), бургер 24px 16px, bell 22px, badge 8px (compactBadge)
- [x] Root layout: Header из @/components/layout, main с классом main-with-header (padding-top 64/72 + safe-area)
- [x] NotificationsBell: compactBadge для header, использует NotificationsPanel
- [ ] Страницы: дублирующий header только в chat/[id] (суб-бар «← Сообщения» + название чата) — оставлен как контекстная полоса, не дубль главного header

## Файлы

- `frontend/shared/constants/zIndex.ts` — числовая шкала
- `frontend/styles/zindex.css`, `layers.css`, `zIndex.ts` — CSS-переменные и утилиты
- `frontend/styles/layout-header.css` — стили header + .main-with-header
- `frontend/components/layout/Header.tsx`, `MobileMenu.tsx`, `NotificationsPanel.tsx`, `index.ts`
- `frontend/app/layout.tsx` — использует Header
- `frontend/shared/ui/NotificationsBell.tsx` — compactBadge, рендер NotificationsPanel

## Проверка готовности

- Логотип по теме (светлая/тёмная)
- Бургер 24px, без гигантского размера
- Уведомления не перекрывают весь экран (dropdown 420px)
- Safe-area учтён (padding-top header + main)
- Нет дерганий (sticky, единый z-index)
- Темы: header фон и glass через data-theme/dark

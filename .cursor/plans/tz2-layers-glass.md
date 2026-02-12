# ТЗ-2: Система слоёв, поверхностей и стеклянного UI (Glass System)

## Цель
Единая система overlay / modal / sheet / header / dropdown / glass-поверхностей. Убрать хаотичную прозрачность (просвечивание панелей, наложение уведомлений, потеря текста, конфликты тем).

## Status
in progress

## Выполнено

### 1. Слои (Z-index)
- **`frontend/styles/layers.css`**: шкала `--z-base` (1), `--z-header` (50), `--z-dropdown` (100), `--z-overlay` (200), `--z-modal` (300), `--z-toast` (400), `--z-tooltip` (500); утилиты `.z-base` … `.z-tooltip`.
- Импорт layers в globals.

### 2. Overlay и panel
- В **globals.css**: классы `.overlay` (fixed, inset:0, rgba(0,0,0,0.45), backdrop-filter blur 6px, z-overlay) и `.panel` (bg-elevated, border-main, z-modal).
- `.modal-overlay` / `.modal-panel`: z-overlay, z-modal; modal-panel — var(--bg-card), border-radius 20px.

### 3. Glass (ограниченно)
- **globals.css**: `.glass` — light: rgba(255,255,255,0.7); dark: rgba(20,20,30,0.7), blur 20px, border. Используется только header / bottom bar / floating.

### 4. Header
- **globals.css**: `.header` — position: sticky, top: 0, z-index: var(--z-header), background: var(--bg-elevated), border-bottom. Убран backdrop-filter (без прозрачности).
- **HeaderLight.tsx**: `sticky top-0 z-header` вместо `fixed z-[999]`.

### 5. Sidebar / Burger menu
- **globals.css**: `.mobile-menu-overlay` — z-overlay, backdrop-filter. `.drawer.mobile-menu` — width 280px, background: var(--bg-elevated), z-modal, border; все dark-переопределения переведены на var(--bg-elevated) (без rgba/blur).

### 6. Уведомления
- **globals.css**: `.notifications-panel` — background: var(--bg-elevated), border, box-shadow: 0 10px 40px rgba(0,0,0,0.4).
- **NotificationsBell.tsx**: overlay всегда с затемнением (класс `overlay z-overlay`), панель `z-modal`; убран `bg-transparent` для десктопа.

### 7. Модалки
- **Modal.tsx**: контейнер `z-overlay`; стили modal-overlay/modal-panel в globals (z-overlay, z-modal, bg-card для panel).
- **HomePageV6.tsx**: AI sheet, onboarding, Quick FAB — z-overlay для overlay, z-modal для панелей; панели с bg-[var(--bg-card)] и border; toast/FAB — z-toast.

### 8. Поля ввода (ТЗ-2 п.13)
- **globals.css**: input, textarea, select, .input — background: var(--bg-surface), border: 1px solid var(--border-main). .hero-search-control — var(--bg-surface), var(--border-main).

### 9. Карточки
- Модальные панели и панели уведомлений используют var(--bg-card) или var(--bg-elevated) по ТЗ. Карточки объявлений — через существующие токены (bg-card).

## Остаётся (опционально)
- Пройтись по оставшимся `background: transparent` в globals (где это контейнеры с текстом — заменить на solid).
- Dropdown в SearchBarAdvanced — при наличии выпадающей панели задать background: var(--bg-elevated), border: var(--border-main), z-dropdown.
- Bottom action bar (если есть отдельный компонент): bg-elevated, backdrop-blur, border-top.

## Файлы
- `frontend/styles/layers.css`
- `frontend/styles/globals.css`
- `frontend/shared/ui/HeaderLight.tsx`
- `frontend/shared/ui/NotificationsBell.tsx`
- `frontend/shared/ui/Modal.tsx`
- `frontend/app/HomePageV6.tsx`

## Проверка после внедрения
- Ни одна панель не прозрачная.
- Меню читается.
- Уведомления не смешиваются с фоном.
- Фильтры не просвечивают.
- Текст не серый на сером.

## Далее
ТЗ-3: Полная перекраска компонентов под обе темы (кнопки, текст, карточки, профили, фильтры).

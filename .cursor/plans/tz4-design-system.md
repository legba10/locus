# ТЗ-4: Унификация всей UI-системы (Core Design System)

## Цель
Единая архитектура интерфейса: темы, компоненты и страницы не ломаются. Управляемый UI.

## Status
in progress

---

## 1. Дизайн-токены (ОБЯЗАТЕЛЬНО)

### Сделано
- **`frontend/styles/tokens.css`** — единственный источник цветов и spacing:
  - **Цвета:** `--bg-main`, `--bg-secondary`, `--surface`, `--card`, `--card-hover`, `--text-primary/secondary/muted`, `--border`, `--divider`, `--accent`, `--accent-hover`, `--accent-soft`, `--danger`, `--success`
  - **Overlay:** `--overlay-bg`, `--bg-overlay`
  - **Тени и стекло:** `--shadow-card`, `--shadow-modal`, `--shadow-elevated`, `--blur-glass`, `--blur-soft`
  - **Spacing:** `--space-4` … `--space-64`, `--space-xs/sm/md/lg`
  - **Z-index (TZ-4):** `--z-header: 50`, `--z-drawer: 100`, `--z-modal: 200`, `--z-toast: 300`
- **Тёмная тема:** `[data-theme="dark"]` переопределяет все токены.
- **Алиасы** для совместимости с theme.css/variables: `--bg-surface`, `--bg-card`, `--surface-primary`, `--input-bg`, `--icon-primary` и др.
- **Запрещено в компонентах:** `#fff`, `#000`, `rgba()`, `bg-black`, `text-white` — только токены.

---

## 2. Система компонентов (`/components/ui/`)

### Сделано
- **Button.tsx** — варианты: `primary` | `secondary` | `ghost` | `outline` | `danger`; размеры: `sm` | `md` | `lg`. Только токены.
- **Card.tsx** — `Card`, `Card.Header`, `Card.Body`, `Card.Footer`, `Card.Title`, `Card.Description`. Токены: `--card`, `--border`, `--shadow-card`, `--divider`.
- **Modal.tsx** — overlay: `--bg-overlay`, `--blur-soft`, `--z-modal`, scroll lock, Escape, portal.
- **Drawer.tsx** — боковая панель (left/right), `--z-drawer`, overlay, scroll lock.
- **BottomSheet.tsx** — нижняя панель, `--z-modal`, overlay, scroll lock.
- **Input.tsx**, **Textarea.tsx**, **Select.tsx** — только токены (`--bg-secondary`, `--border`, `--text-primary`, `--accent`).
- **Checkbox.tsx**, **Switch.tsx** — токены `--accent`, `--border`, `--surface`.
- **Icon.tsx** — цвета: `icon-primary` | `icon-secondary` | `icon-accent` | `icon-muted` (токены). Запрещён жёсткий fill/stroke в svg.
- **index.ts** — экспорт всех компонентов.

---

## 3. Типографика

### Сделано
- **`frontend/styles/typography.css`** — классы: `.text-h1`, `.text-h2`, `.text-h3`, `.text-body`, `.text-small`, `.text-caption`. Цвет через `var(--text-primary)` и т.д. Подключён в globals.css.

---

## 4. Сетка и отступы

### Сделано
- В **tokens.css**: шкала 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 и утилиты `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`.

---

## 5. Иконки

### Сделано
- **`components/ui/Icon.tsx`** — проп `color`: `primary` | `secondary` | `accent` | `muted` (токены `--icon-primary` и др.).

---

## 6. Тени и стекло

### Сделано
- Токены в **tokens.css**: `--shadow-card`, `--shadow-modal`, `--shadow-elevated`, `--blur-glass`, `--blur-soft`. Light/Dark значения заданы.

---

## 7. Z-index

### Сделано
- **tokens.css:** `--z-header: 50`, `--z-drawer: 100`, `--z-modal: 200`, `--z-toast: 300`.
- **layers.css:** расширенная шкала (dropdown, overlay, notification) и утилиты `.z-header`, `.z-drawer`, `.z-modal`, `.z-toast` и др. Запрещён random z-index.

---

## 8. Theme engine

### Сделано
- **useTheme()** в `hooks/useTheme.ts` — SSR-safe, возвращает `{ theme, toggle }` из ThemeContext.
- **ThemeProvider** — хранение в localStorage, переключение без полного перерендера, начальная тема с `document.documentElement.getAttribute('data-theme')` для избежания hydration mismatch.

---

## 9. Рефактор страниц (остаётся)

Переподключить к новой системе:
- карточки объявлений → `Card` из `@/components/ui`
- профиль → формы через `Input`/`Select`/`Card`
- фильтры → `Input`, `Select`, `Button`
- модалки → `Modal` / `Drawer` / `BottomSheet` из `@/components/ui`
- уведомления → уже используют токены; при необходимости перейти на `Card`
- тарифы → `Card`, `Button`

Импорт: `import { Button, Card, Modal, Input } from '@/components/ui'`.

---

## Результат ТЗ-4

После полного рефактора:
- темы работают стабильно;
- UI единый;
- новые страницы не ломают стиль;
- продукт можно масштабировать.

---

## Файлы

- `frontend/styles/tokens.css`
- `frontend/styles/typography.css`
- `frontend/styles/layers.css`
- `frontend/components/ui/Button.tsx`, `Card.tsx`, `Modal.tsx`, `Drawer.tsx`, `BottomSheet.tsx`
- `frontend/components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `Switch.tsx`
- `frontend/components/ui/Icon.tsx`, `ThemeToggle.tsx`
- `frontend/components/ui/index.ts`
- `frontend/hooks/useTheme.ts`
- `frontend/providers/ThemeProvider.tsx`

# ТЗ-9: Уведомления + переключатель темы (засветы, смешанные стили)

## Статус: выполнен

## Сделано

### 1. Единая система цветов (globals.css)
- В блоке `.dark, :root[data-theme="dark"]` заданы: --bg #0f1115, --card-bg #151821, --text #f1f5f9, --text-secondary #9ca3af, --border #2a2e38, --input-bg #1c1f27
- В :root добавлены --border и --input-bg через var(--border-main) и var(--bg-surface)

### 2. Уведомления (NotificationsPanel + globals)
- Контейнер: background var(--card-bg), border var(--border), border-radius 16px, padding 12px, box-shadow 0 12px 40px rgba(0,0,0,0.12)
- Убраны жёсткие #FFFFFF и #0F1115 — везде var(--card-bg)
- Элемент: padding 10px 12px, border-radius 12px, background transparent, color var(--text)
- Hover: background rgba(120,120,120,0.08)
- Текст заголовка и пунктов переведён на var(--text)

### 3. Переключатель темы
- Одна кнопка в хедере (ThemeToggle), в бургере нет дубля
- Стили: width 44px, height 44px, border-radius 12px, display flex, align-items center, justify-content center, background var(--card-bg), border 1px solid var(--border), cursor pointer
- Иконка: 20px (w-5 h-5 + CSS !important)
- Класс theme-toggle-tz9 в компоненте и layout-header.css

### 4. Синхронизация тем
- ThemeProvider уже выставляет data-theme и localStorage при клике и при загрузке
- При загрузке: getInitialTheme() читает data-theme и localStorage

### 5. Фикс для авторизованных (AuthProvider)
- useEffect при монтировании: читает localStorage.getItem("theme") и выставляет document.documentElement.setAttribute("data-theme", theme), чтобы после логина тема не ломалась

### 6. Мобильный фикс (layout-header.css)
- .layout-header__right на max-width 767px: gap 8px
- Кнопка темы с shrink-0 не растягивается

## Файлы
- frontend/styles/globals.css — панель уведомлений на var, тёмные токены
- frontend/styles/layout-header.css — theme toggle 44x44, mobile gap 8px
- frontend/components/ui/ThemeToggle.tsx — класс theme-toggle-tz9, 44x44, border
- frontend/components/layout/NotificationsPanel.tsx — var(--text)
- frontend/domains/auth/AuthProvider.tsx — восстановление темы из localStorage

## Коммит
fix/theme-toggle-and-notifications-ui

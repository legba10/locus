# TZ-77 — Полная стабилизация тем (Theme System Refactor)

## Цель
Полностью разделить light и dark, убрать смешение цветов и хардкод (#fff, #000), перевести проект на CSS variables, сделать тему предсказуемой.

## Статус: ✅ Выполнено (базовый рефактор)

### Сделано

1. **Единый файл токенов** — `styles/theme-tokens-tz77.css`
   - `:root` — общие токены (--primary, --accent, --text-on-accent, --border-radius-*, --danger, --success, --overlay).
   - `html.theme-light` — светлая тема: --bg-primary, --bg-secondary, --bg-card, --text-primary, --text-secondary, --input-bg, --nav-glass-bg, --nav-glass-border и т.д.
   - `html.theme-dark` — тёмная тема: те же токены с тёмными значениями.
   - Совместимость: дублирование селекторов `:root[data-theme="light"]` и `:root[data-theme="dark"]` для скриптов.

2. **Подключение** — в `globals.css` добавлен первым импорт `theme-tokens-tz77.css`, затем theme.css, theme-isolation, tokens.

3. **theme.css**
   - `.card-tz47` переведён на переменные: background/border только var(--bg-card), var(--border-primary), var(--shadow-card). Убраны rgba(255,255,255,0.04) и хардкод границ.

4. **globals.css**
   - Блок "TZ-2: DARK THEME STABILIZATION" переписан: все --bg, --card, --text, --border берутся из var(--bg-primary), var(--text-primary) и т.д. Body background/color — var(--bg-main), var(--text-primary). Theme toggle в dark — var(--bg-surface), var(--border-primary).

5. **Нижнее меню** — `bottom-nav-tz53.css`
   - Фон и граница через var(--nav-glass-bg), var(--nav-glass-border). Добавлены --nav-glass-bg-scrolled в theme-tokens для light/dark. Цвет иконок — var(--text-secondary).

6. **Чат** — `features/chat/chatMessage.module.css`
   - Исходящие пузыри: color заменён с `white` на var(--text-on-accent).

7. **Компоненты и страницы (выборочно)**
   - Градиенты фона (user/[id], ListingPageV2, admin/ai): заменены на var(--bg-card), var(--bg-primary).
   - UserAvatar: убран fallback #fff у --text-on-accent.
   - ListingWizard, admin/ai, ListingMetricsCard, MobileFilters, FilterBar, StepPreview: замены text-[#6B7280], text-[#1C1F26], bg-[#3b82f6], text-white на var(--text-secondary), var(--text-primary), var(--accent), var(--text-on-accent).

8. **tz61-ui-cleanup.css** — граница #e6e8f2 заменена на var(--border-primary).

### Правило с этого момента
- Ни один компонент не должен содержать цвет напрямую (#fff, #000, rgba(0,0,0), rgba(255,255,255)).
- Только через theme tokens: var(--bg-card), var(--text-primary), var(--border-primary) и т.д.
- Переключатель темы уже есть в ThemeProvider (toggle, setTheme); layout выставляет theme-light/theme-dark на documentElement.

### Что осталось (по проекту)
- Часть файлов всё ещё содержит хардкод (например, globals.css — тени с rgba(0,0,0); отдельные компоненты — bg-white, text-white, border-gray-200). Их можно вычищать по мере правок, опираясь на правило выше.
- Рекомендация: при любом новом стиле использовать только var(--token).

### Проверки
- Light и dark разделены в theme-tokens-tz77.css.
- Карточки и фон body используют переменные.
- Чат, нижнее меню, хедер — через переменные.
- Нет смешения в ключевых блоках (карточки, чат, навбар).

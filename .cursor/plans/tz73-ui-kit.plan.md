# TZ-73: UI Kit Foundation

## Цель
Единый UI-Kit: без хаотичных стилей, разных размеров кнопок, разной типографики и случайных цветов. После — ни один экран не должен содержать кастомного CSS вне системы.

## Архитектура

```
frontend/ui/
  tokens/       colors, spacing, radius, sizes
  components/  Button, Card, Input, MenuItem, ChatBubble
  layouts/     ContentShell
```

## Сделано

### Tokens
- [x] `ui/tokens/colors.ts` — primary, bgDark, bgCardDark, bgLight, bgCardLight, textPrimary/Secondary Light/Dark
- [x] `ui/tokens/spacing.ts` — xs:4, sm:8, md:16, lg:24, xl:32
- [x] `ui/tokens/radius.ts` — sm:12, md:16, lg:20, xl:24, round:999
- [x] `ui/tokens/sizes.ts` — button:52, buttonSmall:40, buttonIcon:44, input:52, navHeight:64
- [x] `ui/tokens/index.ts` — реэкспорт

### Компоненты
- [x] **UIButton** — variant: primary | secondary, size: default(52px) | small(40px), только классы, без inline
- [x] **UICard** — фон/тень/радиус 20px/padding из системы
- [x] **UIInput** — высота 52px, радиус 12px, один тип
- [x] **UIMenuItem** — icon + title, href, active
- [x] **UIChatBubble** — type: incoming | outgoing, max-width 75%, padding 12px 16px, radius 18px

### Layouts
- [x] **ContentShell** — max-width 720px, px 16px, дочерние блоки mt-6 (24px)

### Правила
- Запрещено использовать HEX вне `ui/tokens/colors.ts`
- Запрещено: 13px, 19px, 27px — только spacing
- Компоненты используют var(--primary), var(--bg-card) и т.д. для темы

## Дальше (рефакторинг)
1. Переписать Профиль, Главную, Фильтры, Чат, Добавление объявления на компоненты из `@/ui`
2. Удалить дублирующие старые стили
3. ThemeProvider уже есть; токены подставляются через CSS-переменные в theme.css

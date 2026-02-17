# План: ТЗ №2 — Header (аватар, выравнивание, размеры, mobile-first)

## Цель

Единый размер интерактивных элементов header: кнопка темы, уведомления, аватар. Всё по одной сетке, без перекоса.

## Базовые размеры (ТЗ №2)

| Элемент              | Размер    |
|----------------------|-----------|
| icon button container| 44×44 px  |
| иконка внутри       | 20–22 px  |
| аватар              | 36×36 px  |
| gap между кнопками  | 8 px      |

## Выполнено

### 1. IconButton (`components/ui/IconButton.tsx`)
- Размер 44×44 px, `borderRadius: 12`, `var(--bg-card)`, `var(--border-main)`.
- Используется для: бургер, сообщения, избранное, колокольчик, тема.

### 2. UserAvatar (`components/ui/UserAvatar.tsx`)
- Размер 36×36 px, круг, инициалы при отсутствии фото, градиент фона.
- Не внутри IconButton — отдельный элемент.

### 3. Header actions
- Класс `.header-actions`: `display: flex`, `align-items: center`, `gap: 8px`.
- Убран лишний wrapper `layout-header__icon-wrap` вокруг NotificationsBell — все действия в одном ряду с единым gap.

### 4. Выравнивание
- `.layout-header`: `display: flex`, `align-items: center` (высота 64px mobile задаётся через `h-16` в разметке).
- Кнопка «Войти»: `min-height: 44px` для выравнивания с иконками; стиль через `var(--accent)` и `var(--text-on-accent)`.

### 5. Состояния
- Без пользователя: показывается кнопка «Войти».
- После логина: колокольчик (NotificationsBell), переключатель темы (ThemeToggle), аватар (UserAvatar).

## Критерии готовности

- [x] аватар = 36 px  
- [x] кнопки = 44 px  
- [x] gap = 8 px  
- [x] выравнивание по вертикали  
- [ ] проверка на iPhone (вручную)

## Не делать

- Не ставить аватар 24 px.
- Не использовать разный padding / случайные margin.

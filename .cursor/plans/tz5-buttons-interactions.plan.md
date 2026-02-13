# TZ-5: Кнопки, интерактив, hover/active/focus, состояния UI

**Цель:** единые дизайн-токены и поведение для всех интерактивных элементов. Без смены архитектуры/бекенда.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Токены (radius, space, font-size, transition, colors) | ✅ tokens.css: --radius-sm/md/lg, --space-xs, --font-size-*, --transition-fast/medium, --easing, --color-primary/primary-600/accent/danger/surface/text/muted, --shadow-1; dark theme vars |
| 2 | Button: primary, secondary, ghost, danger | ✅ Button.tsx + buttons-tz5.css, размеры sm(38)/md(48)/lg(56), loading spinner, aria-busy |
| 3 | Burger: 3 полоски, 28×28, hit area 44×44 | ✅ layout-header.css + globals .burger; без крестика, focus-visible ring |
| 4 | Sidebar: 360px desktop, 320px mobile | ✅ .drawer.mobile-menu max-width 320px, @media 768 → 360px |
| 5 | Меню: full width, текст слева, иконка справа | ✅ NavItem justify-between, label + icon |
| 6 | Войти — btn--primary, Выйти — btn--danger full width | ✅ Заменены классы в Header |
| 7 | Focus ring, reduced-motion | ✅ :focus-visible box-shadow, prefers-reduced-motion в .btn и .burger |
| 8 | aria-label, aria-expanded на бургере | ✅ Header burger aria-label, aria-expanded |

---

## Файлы

- `frontend/styles/tokens.css` — убраны дубли, добавлен --space-xs
- `frontend/styles/buttons-tz5.css` — .btn, .btn--primary/secondary/ghost/danger, sizes, focus, loading gap
- `frontend/components/ui/Button.tsx` — уже с вариантами и loading
- `frontend/styles/layout-header.css` — бургер 44px hit area, 28px полоски
- `frontend/styles/globals.css` — .burger унифицирован, .drawer.mobile-menu ширина, .menu-list gap 12px, .menu-item-btn justify-between + focus-visible, logout-wrap под .btn--danger
- `frontend/components/layout/Header.tsx` — NavItem (label слева, icon справа), CTA btn--primary, Выйти btn--danger, burger aria-expanded

---

## Оставшиеся шаги
- Создать ветку `fix/ui/buttons-and-interactions` и закоммитить изменения.
- Заменить оставшиеся `btn-primary`/`menu-cta` в других файлах при необходимости (глобальные стили в globals.css оставлены для совместимости).
- Хук `frontend/hooks/useLoadingButton.ts` добавлен — можно использовать на главных CTA для aria-busy и блокировки повторных кликов.

## Проверка (QA)

- Desktop: главная → header → бургер → пункты видны, выравнивание, full width.
- Mobile: тап по бургеру, hit area, закрытие по клику вне.
- Primary CTA: hover lift, active press, без сдвига layout.
- Loading: спиннер, aria-busy, disabled.
- Keyboard: Tab по кнопкам, видимый focus ring.
- Контраст light/dark (WCAG AA).
- Бургер не превращается в крестик/круг.

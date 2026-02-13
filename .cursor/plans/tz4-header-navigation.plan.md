# ТЗ-4: Header и навигация

## Цель
Новый header: баланс, нормальный spacing, не кривые кнопки.

## Структура (Desktop)
Лого | Поиск | Избранное | Сообщения | Профиль | [колокольчик] [тема] | Разместить

## Сделано

### Структура
- Центральный блок `.layout-header__center`: лого + нав в одном flex (flex-1, gap-4).
- Нав — иконки: Поиск (/listings), Избранное (/favorites), Сообщения (/messages), Профиль (/profile или /auth/login).
- Справа: колокольчик (если авторизован), переключатель темы, кнопка «Разместить» или «Войти».

### Кнопка «Разместить»
- Класс `.layout-header__cta-btn`: `bg-gradient-to-r from-violet-600 to-indigo-600`, `rounded-xl`, `px-4 py-2` (8px 16px), белый текст.
- В `layout-header.css`: linear-gradient(#7c3aed, #4f46e5), border-radius 12px.

### Иконки
- Класс `.layout-header__nav-icon`: в светлой теме — `var(--text-secondary)` / hover `var(--text-main)`; в тёмной — `rgba(255,255,255,0.7)` / hover `#fff`.
- Размер кликабельной области: 40×40px (w-10 h-10), иконки 20×20 (w-5 h-5), rounded-xl.
- Колокольчик и ThemeToggle обёрнуты в тот же класс для единого стиля.

### Файлы
- `frontend/components/layout/Header.tsx` — новая разметка, desktopNavIcons с иконками (Search, Heart, MessageCircle, User), одна кнопка CTA.
- `frontend/styles/layout-header.css` — стили `.layout-header__nav-icon`, `.layout-header__cta-btn`, `.layout-header__center`.

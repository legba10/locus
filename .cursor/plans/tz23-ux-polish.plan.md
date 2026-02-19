# TZ-23 — UX-полировка и стабилизация интерфейса

## Цель
Довести интерфейс до консистентного состояния без изменения архитектуры (ТЗ-22 зафиксировал структуру).

## Выполнено

### 1. Header — 56px, sticky
- Переменная `--header-height: 56px` в variables.css.
- Header: `h-[56px] min-h-[56px]`, layout-header.css и tz22-polish приведены к 56px.
- main-with-header: `padding-top: calc(var(--header-height) + safe-area)`.
- Сообщения/чат: использование 56px для top и height.

### 2. Нижнее меню
- Активное состояние: `bg-[var(--accent)]/10` для активного пункта.
- `backdrop-blur-md`, `bg-[var(--bg-card)]/90`, safe-area в padding-bottom.
- Единый состав: Главная, Поиск, Добавить, Сообщения, Профиль.

### 3. Чат
- Отступ снизу для колонки чата: класс `chat-column-mobile-pb` с `padding-bottom: max(56px, calc(56px + env(safe-area-inset-bottom)))`.
- Поле ввода не перекрывается bottom bar.

### 4. Страница объявления
- Нижняя панель StickyActions: порядок [♡] [Написать] [Забронировать], высота 72px.
- Лёгкие active-переходы (scale) на кнопках.

### 5. Фильтры поиска
- Убран дубликат FiltersModal (второй рендер в конце SearchPageV4 удалён).
- На mobile показывается только MobileFilters, на desktop — только FiltersModal.
- При применении фильтров на mobile вызывается handleSearch.

### 6. Кабинет /dashboard
- Блоки с переходами и лёгкой анимацией (active:scale, transition).

### 7. Визуальная консистентность
- Единая высота header 56px по приложению.
- Токены --header-height, --bottom-nav-height в :root.

## Не трогали
- AI-метрики, карточку объявления, логику (только полировка).
- Профиль/настройки (смена аватара, пароля, email, сессии) — уже есть в профиле/настройках; /dashboard/profile редирект на /profile.

## Статус
Полировка применена. Готово к commit/push.

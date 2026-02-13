# TZ-7 Theme stabilization (light/dark)

## Status
completed

## Done (final pass)
- **theme.css**: единый слой токенов `:root` (--bg, --card, --text, --border, --accent) и `.dark` / `[data-theme="dark"]` с палитрой без засветов (--card #11161c, --text #e5e7eb).
- **Бургер**: `.drawer.mobile-menu` — фон `var(--card)`, backdrop-blur, без прозрачности; dark override тоже `var(--card)`.
- **Footer**: уже `bg-[var(--card)] text-[var(--text)] border-[var(--border)]`.
- **Фильтры**: FilterPanel и `.filter-panel-card` используют `var(--card)` и `var(--border)`.
- **Уведомления**: NotificationsPanel — контейнер и секции `bg-[var(--card)] text-[var(--text)] border-[var(--border)]`.
- **Карточки объявлений**: ListingCard `bg-[var(--card)] border border-[var(--border)]`; фото контейнер aspect-ratio 4/3, max-height 260px, object-fit cover.
- **Кнопки**: primary — `var(--accent)`, hover:opacity-90; search-hero-submit-tz7-compact из палитры.
- **Страница поиска**: empty state блок на `var(--card)` и `var(--border)`.
- **ListingPage**: хлебные крошки и заголовок на `var(--text)`, кнопка «Забронировать» — `var(--accent)`.

## Files
- `frontend/styles/theme.css`
- `frontend/styles/globals.css`
- `frontend/styles/listing-card-tz6.css`
- `frontend/styles/search-tz7.css`
- `frontend/styles/buttons-tz5.css`
- `frontend/components/layout/NotificationsPanel.tsx`
- `frontend/components/listing/ListingCard.tsx`
- `frontend/app/listings/SearchPageV4.tsx`
- `frontend/app/listings/[id]/ListingPage.tsx`

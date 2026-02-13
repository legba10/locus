# TZ-9: Профиль пользователя + карточки объявлений

**Цель:** профиль и карточки на продукт-уровне. Только UI/логика.

---

## Статус

| # | Задача | Статус |
|---|--------|--------|
| 1 | Разделение: настройки /profile, публичный /user/[id] | ✅ уже разделено |
| 2 | Profile header: контейнер 18px, padding 20px, light/dark | ✅ profile-tz9.css + profile page |
| 3 | Аватар 80px, клик → загрузка; имя 20px 600 | ✅ |
| 4 | Смена имени: PATCH → refresh store, full_name/name | ✅ |
| 5 | Публичный профиль: статистика 3 блока, рейтинг ★ 4.7, без смайлов | ✅ |
| 6 | Карточки объявлений (MyListings): ListingCard, grid 3/1, вся карточка кликабельна | ✅ |
| 7 | Убрать смайлы в кнопке «Добавить объявление» | ✅ |
| 8 | Секции профиля на токенах (light/dark) | ✅ |

---

## Файлы

- `frontend/styles/profile-tz9.css` — контейнер, аватар, имя, блок статистики, рейтинг, dark theme.
- `frontend/app/profile/page.tsx` — настройки: убран блок прогресса и 3 стата, header с аватар 80px, имя; синхронизация full_name после PATCH; секции на токенах.
- `frontend/app/user/[id]/page.tsx` — публичный профиль: profile-header-tz9, stats grid, рейтинг со звездой, сетка ListingCard.
- `frontend/app/owner/dashboard/OwnerDashboardV7.tsx` — MyListingsTab: сетка listing-grid, ListingCard для каждого объявления (полный клик), кнопка без эмодзи; удалён дублирующий блок старых карточек.
- `frontend/styles/globals.css` — импорт profile-tz9.css.

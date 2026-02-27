# TZ-66: Централизованный RBAC (роли и разграничение прав)

## Ролевая модель
- **guest** — не авторизован
- **user** — авторизован, без объявлений
- **landlord** — авторизован, есть объявления (или role=landlord)
- **admin** — user.role === 'admin' (не перезаписывается)

## Выполнено
- [x] `frontend/domains/auth/permissions.ts` — resolveRole, buildPermissions, Permissions
- [x] `frontend/domains/auth/usePermissions.ts` — хук usePermissions(context?)
- [x] Профиль: секции по canSeeMyListings, canSeeFinance, canSeePromo, canSeeAnalytics, canSeeAdminPanel
- [x] Страница объявления (ListingPageTZ8): кнопки по usePermissions (user: Написать/Забронировать/В избранное; owner: Редактировать/Календарь/Продвижение/Аналитика; admin: Модерация/Статус)
- [x] Бэкенд: комментарии TZ-66 для isPrivileged (skipPayment/skipModeration)

## Проверки после TZ-66
- Роли работают предсказуемо
- Админ не теряет админ-панель
- Пользователь не видит лишнего
- Лендлорд видит управление
- Нет конфликтов в кнопках, нет дублей

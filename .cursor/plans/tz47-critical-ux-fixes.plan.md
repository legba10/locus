# TZ-47: Критический UX-фикс профиля, размещения объявлений и навигации

**Статус:** Выполнено  
**Приоритет:** BLOCKER

## Задачи

- [x] 1. Переверстать профиль (сетка 8pt, контейнер 720px, карточки 56px)
- [x] 2. Убрать белые бордеры (новая система box-shadow/border)
- [x] 3. Починить create listing (layout, кнопки Назад/Далее)
- [x] 4. Добавить CTA «Разместить объявление» в header/profile/dashboard
- [x] 5. Исправить нижнее меню (убрать purple glow)
- [x] 6. Админ без оплаты (backend — лимиты и модерация уже bypass)

## Файлы

- `frontend/app/profile/page.tsx` — профиль
- `frontend/styles/layout.css` — контейнер профиля
- `frontend/styles/theme.css` — карточки, бордеры
- `frontend/modules/listingForm/listingWizard.tsx` — wizard
- `frontend/shared/ui/HeaderLight.tsx` — CTA, createHref (admin без лимита)
- `frontend/components/layout/BottomNavGlobal.tsx` — нижнее меню
- `frontend/app/admin/AdminDashboardV2.tsx` — CTA в админке

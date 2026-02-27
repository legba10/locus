# TZ-48: Полная переработка create listing flow

**Статус:** Выполнено  
**Тип:** критический UX-блокер

## Реализовано

- [x] 1. Структура flow — 8 шагов: Тип → Адрес → Фото → Параметры → Описание → Цена → Проверка → Публикация
- [x] 2. Layout — max-width 720px mobile, 900px desktop, flex column, gap 20px
- [x] 3. Верхний прогресс — sticky, «Шаг X из 8», progress bar height 4px
- [x] 4. Нижняя панель — fixed, [Назад] [Далее] / [Опубликовать], padding 14px, gap 12px
- [x] 5. Карточки шагов — border-radius 16px, padding 18px, grid gap 14px, card-tz47
- [x] 6. Шаг фото — до 10 фото, drag reorder, grid 2x
- [x] 7. Валидация — Далее disabled при отсутствии фото/адреса/цены/заголовка
- [x] 8. Desktop — max-width 900px, шаги слева, превью справа (280px)
- [x] 9. Админ — backend уже bypass (isPrivileged)
- [x] 10. Draft — persist в localStorage (listingStore)
- [x] 11. UI — card-tz47 без белых обводок

## Файлы

- `frontend/modules/listingForm/listingWizard.tsx`
- `frontend/modules/listingForm/steps/PhotosStep.tsx`
- `frontend/modules/listingForm/ListingPreviewCard.tsx`
- `frontend/modules/listingForm/photoController.ts`
- `frontend/modules/listingForm/listingStore.ts`
- `frontend/app/profile/listings/create/page.tsx`

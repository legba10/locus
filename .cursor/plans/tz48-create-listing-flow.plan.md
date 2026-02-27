# TZ-48: Полная переработка create listing flow

**Статус:** Выполнено  
**Тип:** критический UX-блокер

## Шаги (порядок TZ-48)
1. Тип жилья
2. Адрес
3. Фото
4. Параметры (Удобства)
5. Описание
6. Цена
7. Проверка
8. Публикация

## Задачи
- [x] Reorder steps (Параметры перед Описанием)
- [x] Layout 720px, gap 20px, progress 4px
- [x] Bottom panel fixed, padding 14px, gap 12px
- [x] PhotosStep onReorder, AddressStep theme
- [x] Desktop 900px + preview sidebar

## Файлы
- `frontend/modules/listingForm/listingWizard.tsx`
- `frontend/modules/listingForm/steps/PhotosStep.tsx`
- `frontend/modules/listingForm/steps/AddressStep.tsx`

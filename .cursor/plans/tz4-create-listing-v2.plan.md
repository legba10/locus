# ТЗ 4 — Полный флоу создания объявления (Listing Creation System v2)

## Цель
Пошаговый конструктор объявления: 8 шагов, без дублей текста, один раз сообщение об ошибке фото, UX уровня Cian/Airbnb. Backend не трогаем.

## Статус

| Часть | Описание | Статус |
|-------|----------|--------|
| 1 | Шаг 1 — Тип жилья (квартира, студия, дом, комната, апартаменты) + Посуточно/Длительно | ✅ |
| 2 | Шаг 2 — Адрес (город, район, улица, дом, карта) | ✅ |
| 3 | Шаг 3 — Фото: min 5 max 30, один раз ошибка, drag&drop, главное фото | ✅ |
| 4 | Шаг 4 — Параметры (комнаты, площадь, этаж, ремонт, мебель, техника) | ✅ |
| 5 | Шаг 5 — Описание + AI заглушка | ✅ |
| 6 | Шаг 6 — Цена (цена, залог, комиссия, коммуналка, сутки/месяц) | ✅ |
| 7 | Шаг 7 — Проверка (превью карточки) | ✅ |
| 8 | Шаг 8 — Публикация, редирект в «Мои объявления» | ✅ |
| UX | Прогресс 1/8, Назад/Далее, карточка glass border-16 padding-24 | ✅ |
| Fix | Дубли текста фото убраны, одна кнопка «Разместить» (уже в ТЗ2) | ✅ |
| Components | CreateListingLayout, StepType, StepAddress, StepPhotos, StepDetails, StepDescription, StepPrice, StepPreview | ✅ |

## Файлы
- `frontend/config/uiFlags.ts` — useCreateListingV2
- `frontend/domains/listings/CreateListingWizardV2.tsx` — визард + layout
- `frontend/domains/listings/steps/` — StepType, StepAddress, StepPhotosV2, StepDetails, StepDescription, StepPrice, StepPreview
- Подключение в DashboardV2 / OwnerDashboardV7: при useCreateListingV2 рендерить CreateListingWizardV2 вместо ListingWizard

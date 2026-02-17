# ТЗ №8 — Страница «Параметры для AI» после регистрации

## Цель
Сделать экран /ai-params читаемым, без засветов, с иерархией, сохранением, понятной логикой, mobile-first. Первый экран после регистрации.

## Статус: ✅ выполнено

### Сделано

1. **Структура экрана**
   - Заголовок «Поможем AI подобрать жильё», подтекст, блок параметров, кнопки «Сохранить и продолжить» и «Пропустить».

2. **Устранение засветов**
   - Заголовок: `var(--text-primary)`.
   - Подтекст и лейблы: `var(--text-secondary)`.
   - Инпуты: `var(--bg-input)`, `var(--text-primary)`, `var(--border-main)`.

3. **Карточка экрана**
   - Контейнер: `bg-[var(--bg-card)]`, `border border-[var(--border-main)]`, radius 20, padding 16.

4. **Параметры AI**
   - Бюджет (₽/мес), районы (текст), тип жилья (квартира/комната/студия/дом), длительность (посуточно/неделя/месяц/долгосрочно), количество комнат.
   - Каждый параметр — отдельный блок (AiParamField / AiParamSelect).

5. **Input-стиль**
   - `background: var(--bg-input)`, `color: var(--text-primary)`, `border: 1px solid var(--border-main)`, radius 12.

6. **Сохранение**
   - Кнопка «Сохранить и продолжить» → `PATCH /api/profile` с `ai_params: { budget, rooms, district, duration, propertyType }` → `router.push("/owner/dashboard")`.

7. **Пропуск**
   - Кнопка «Пропустить» → сохранение `ai_params: { skipped: true }` → редирект в кабинет (чтобы шаг не показывался повторно).

8. **Структура данных**
   - `AiParamsData`: budget, rooms, district, duration, propertyType. В БД: `Profile.aiParams` (jsonb).

9. **Проверка повторного показа**
   - При заходе на /ai-params: `GET /api/profile`; если `aiParams != null` (заполнено или пропущено) → редирект в /owner/dashboard.

10. **Backend**
    - Prisma: в модель `Profile` добавлено поле `aiParams Json?`.
    - Миграция: `24_profile_ai_params`.
    - DTO: в `UpdateProfileDto` добавлено `ai_params?: Record<string, unknown>`.
    - `ProfileService`: сохранение и возврат `aiParams` в `updateProfile` и новый метод `getProfile(userId)`.
    - `ProfileController`: `GET /profile` (текущий профиль с aiParams), `PATCH /profile` принимает `ai_params`.

11. **Компоненты**
    - `components/ai/AiParamField.tsx` — лейбл + input (и AiParamSelect для выбора).
    - `components/ai/AiParamsForm.tsx` — форма с полями и кнопками.

12. **Защита**
    - Маршрут /ai-params добавлен в PROTECTED_PATHS (редирект на логин при 401).

### Критерии готовности (ТЗ №8)
- ✔ Текст читаем
- ✔ Нет засветов
- ✔ Данные сохраняются в Profile.aiParams
- ✔ Есть skip с сохранением метки
- ✔ Mobile (адаптивная форма и кнопки)

### Не трогали
- Фото-загрузчик, объявления, header.

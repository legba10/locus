# UI-FIX-MOBILE-LISTINGS (CRITICAL)

Цель: мобильный блок «Мои объявления» — пиксель-перфект, локализация, стабильный layout. Без изменений backend/API/тарифов.

## Статус: выполнено

### Сделано

1. **Карточка (OwnerDashboardV7 → MyListingsTab)**
   - Контейнер: `width: 100%`, `padding: 16px`, `border-radius: 20px`, `flex flex-col gap: 12px`.
   - Фото: фиксированная высота `180px` / `min-height: 180px`, `position: relative; overflow: hidden`, `rounded-[14px]`, `object-cover` (Next/Image `fill`) — убраны дергания.
   - Заголовок: `18px`, `font-semibold`, `line-clamp: 2`.
   - Город + цена: `flex justify-between`.
   - Удобства: `flex flex-wrap gap-[6px]`, чипсы `12px`, `padding 6px 10px`, `rounded-full`, `bg-[#F3F4F6]`; вывод только через `amenityLabel()` (русская локализация).

2. **Локализация удобств**
   - В `core/i18n/ru.ts`: `AMENITIES_MAP` (wifi → Wi-Fi, washer → Стиральная машина, balcony → Балкон, parking → Парковка, air_conditioner → Кондиционер и др.) и хелпер `amenityLabel(key)` — raw key в UI не выводится.

3. **AI-блок**
   - На mobile скрыт: обёрнут в `hidden md:block` (показ только на desktop). На mobile карточка не ломается.

4. **Кнопки**
   - Сетка: `grid grid-cols-3 gap-2` (Открыть, Редактировать, Удалить) — без скачков и наложений.

5. **Список карточек**
   - Контейнер списка: `flex flex-col gap-4` (16px), `pb-[120px]` — единая колонка на mobile, стабильный scroll.

### Файлы изменены

- `frontend/core/i18n/ru.ts` — добавлены `AMENITIES_MAP`, `amenityLabel()`.
- `frontend/app/owner/dashboard/OwnerDashboardV7.tsx` — переработан блок карточек в `MyListingsTab`: вертикальная карточка, фото 180px, чипсы через `amenityLabel`, AI скрыт на mobile, кнопки в grid.

### Запреты соблюдены

- Backend, API, тарифы, auth не трогались. Только UI и слой отображения данных.

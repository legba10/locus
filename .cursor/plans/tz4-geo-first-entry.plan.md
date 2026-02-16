# ТЗ-4: Геолокация при первом входе (автоопределение города)

## Цель
При первом заходе автоматически определить город пользователя и подставить в фильтр. Без ломания UX, без агрессии (как в такси/airbnb).

## Реализация

### Компонент `components/geo/GeoInit.tsx`
- Запускается 1 раз при загрузке (useEffect, только клиент).
- Проверка `localStorage.getItem("user_city")` — если есть, не трогаем.
- Если нет — проверяем сохранённый город в `locus_filter_state`; если есть — пишем в `user_city` и выходим.
- В Telegram WebApp гео не запрашиваем автоматически (ТЗ-4.12).
- Запрос геолокации: `navigator.geolocation.getCurrentPosition` с таймаутом 5–7 сек (6 сек).
- При успехе: reverse geocode через Nominatim → город → показ попапа «Ваш город: X. Использовать? [Да] [Выбрать другой]».
- «Да» → `setCity(city)`, `localStorage.setItem("user_city", city)`.
- «Выбрать другой» → dispatch события `locus-open-city-picker` → на главной открывается фильтр (выбор города).
- При отказе/таймауте/ошибке → город по умолчанию Москва, сохраняем в store и `user_city`.

### Интеграция
- **layout.tsx**: подключён динамический `GeoInit` (ssr: false).
- **HomePageV6.tsx**: подписка на `locus-open-city-picker` → `setFilterSheetOpen(true)`.

### Reverse geocode
- Используется Nominatim: `https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json&accept-language=ru`.
- Из ответа берётся город: `city ?? town ?? village ?? municipality ?? ...`.

## Статус
- [x] GeoInit.tsx создан и реализует логику
- [x] Подключение в layout
- [x] Событие открытия выбора города на главной
- [ ] При необходимости: кнопка «Определить город» в Telegram (отдельная задача)

## Acceptance (чек-лист)
- [ ] Город определяется при первом входе (без user_city)
- [ ] Подставляется в фильтр и сохраняется
- [ ] Интерфейс не дёргается, попап «Использовать? Да / Выбрать другой»
- [ ] Mobile ok
- [ ] В Telegram авто-гео не запрашивается

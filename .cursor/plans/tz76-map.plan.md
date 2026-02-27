# TZ-76 — Карта + Геокодер + Автоподстановка адреса

## Цель
Адрес через карту; ввод адреса двигает карту; клик по карте определяет адрес; город и улица подсвечиваются; сохраняются lat, lng; без пустой карты и без iframe.

## Статус: ✅ Выполнено

### Сделано

1. **global.d.ts** — объявлен `Window.ymaps: any` для Yandex Maps JS API 2.1.

2. **/features/map/MapPicker.tsx**
   - Подключение скрипта: `next/script` с `https://api-maps.yandex.ru/2.1/?apikey=KEY&lang=ru_RU` (ключ: `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` или `NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY`).
   - Инициализация карты в `ymaps.ready`: центр по умолчанию Сургут [61.25, 73.43], zoom 12.
   - Перетаскиваемый Placemark; при `dragend` и при клике по карте — геокодирование координат, `onChange({ address, lat, lng, city, street })`.
   - Поле «Введите адрес для поиска» + кнопка «Найти»: `ymaps.geocode(address)` → центр карты и маркер обновляются, вызывается `onChange`.
   - Поддержка `initialCenter` для редактирования (lat, lng).
   - Высота карты через проп `height` (по умолчанию 300px).
   - Если ключ API не задан — сообщение «Укажите NEXT_PUBLIC_YANDEX_MAPS_API_KEY».
   - Стили в **map.module.css** (без inline, кроме height).

3. **/domains/listings/steps/StepAddress.tsx**
   - Интеграция **MapPicker**: выбор адреса на карте или через поиск.
   - Город и улица — только из карты: `readOnly`, класс **filled** при непустом значении (подсветка `border: 2px solid var(--primary)` в StepAddress.module.css).
   - Район и дом/корпус — опциональный ручной ввод.
   - Пропсы: `lat`, `lng`, `onAddressDataChange`. При изменении карты вызывается `onAddressDataChange` и обновляются city/street в визарде.

4. **CreateListingWizardV2**
   - Состояние: `lat`, `lng`, `addressFromMap`.
   - При загрузке `initialListing`: заполнение `lat`, `lng`, `addressFromMap` из объявления.
   - `addressLine`: при наличии `addressFromMap` используется он, иначе сборка из district, street, building, city.
   - В шаге «Адрес» передаются `lat`, `lng` и `onAddressDataChange` (устанавливает lat, lng, addressFromMap).
   - В все payload (черновик, сохранение и выход, публикация) добавлены `lat` и `lng`.
   - Валидация шага 1: обязательны город и координаты (`lat != null && lng != null`).

### Проверки по ТЗ
- Клик по карте обновляет адрес (геокодер).
- Перетаскивание маркера обновляет адрес.
- Координаты сохраняются в state и уходят в API (lat, lng в payload).
- Город и улица заполняются из геокодера и отображаются в readOnly с подсветкой.
- После сохранения объявления координаты уходят на бэкенд (поля lat, lng в PATCH/POST).

### Запреты (соблюдены)
- Без iframe (используется только Yandex JS API 2.1).
- Карта не показывается без геокодера (клик/драг всегда вызывают geocode и onChange).
- Ручной ввод адреса только через поиск по карте (поиск → геокод → обновление карты и формы).

### Дальше
ТЗ-77 — Полная стабилизация тем.

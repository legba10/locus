## MVP Stage 2 — Checklist (Core Platform + AI integration)

### Цель
Превратить “архитектуру” в рабочий backend MVP (Avito/Airbnb-like) с интегрированным AI.

---

### 1) Core: Users / Auth
- [ ] `POST /api/v1/users/register` работает (guest/host)
- [ ] `POST /api/v1/auth/login` возвращает JWT
- [ ] `GET /api/v1/users/me` работает (JWT)
- [ ] роли в JWT: guest/host/admin

---

### 2) Core: Listings
- [ ] `POST /api/v1/listings` создаёт draft объявление (только host/admin)
- [ ] `PATCH /api/v1/listings/:id` редактирует объявление (только владелец)
- [ ] `POST /api/v1/listings/:id/publish` публикует
- [ ] `POST /api/v1/listings/:id/unpublish` снимает с публикации
- [ ] `GET /api/v1/listings/:id` отдаёт публичные данные (включая фото/amenities)

---

### 3) Core: Search
- [ ] `GET /api/v1/search?city=&q=&priceMin=&priceMax=&guests=&amenities=` возвращает список
- [ ] сортировка: newest / price_asc / price_desc
- [ ] AI-режим: `GET /api/v1/search?ai=1&q=...` возвращает `ai` блок + ранжированный список

---

### 4) Core: Bookings
- [ ] `POST /api/v1/bookings` создаёт бронирование (pending)
- [ ] проверка пересечений дат работает
- [ ] проверка availability календаря работает
- [ ] `POST /api/v1/bookings/:id/confirm` (host) переводит в confirmed
- [ ] `POST /api/v1/bookings/:id/cancel` (guest/host) переводит в canceled
- [ ] `GET /api/v1/bookings/:id` доступен гостю/хосту брони

---

### 5) Availability & Pricing
- [ ] `GET /api/v1/availability/:listingId?from=&to=` (host) показывает календарь
- [ ] `PUT /api/v1/availability/:listingId` массово обновляет availability/priceOverride
- [ ] `GET /api/v1/availability/:listingId/ai-pricing` возвращает AI-рекомендацию цены

---

### 6) Analytics
- [ ] `GET /api/v1/analytics/host/overview` возвращает метрики хоста:
  - listingsTotal/listingsPublished
  - bookingsPending/bookingsConfirmed
  - revenueConfirmed
  - occupancyNext30Pct

---

### 7) AI интеграция “влияет на продукт”
- [ ] При создании/редактировании объявления пересчитываются:
  - AI quality
  - AI pricing
  - AI risk
- [ ] Эти сигналы сохраняются в БД (AiListingScore / AiEvent)

---

### 8) Seed
- [ ] `npm run db:seed` создаёт:
  - 5 пользователей (2 host, 2 guest, 1 admin)
  - 10 объявлений
  - availability на 60 дней
  - 10 бронирований


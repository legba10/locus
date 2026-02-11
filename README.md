# LOCUS — AI-first Rental Marketplace

Платформа для аренды недвижимости с AI-ассистентом.

## Tech Stack

### Backend
- **NestJS** — фреймворк
- **Prisma ORM** — работа с БД
- **PostgreSQL (Neon)** — база данных
- **Supabase Storage** — хранение изображений
- **JWT** — аутентификация
- **REST API** — endpoints

### Frontend
- **Next.js 14 (App Router)** — фреймворк
- **TypeScript** — типизация
- **TailwindCSS** — стили
- **Zustand** — state management
- **React Query** — серверный state

## Быстрый старт

### 1. Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Backend запустится на `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/v1/auth/register` — регистрация
- `POST /api/v1/auth/login` — вход
- `GET /api/v1/auth/me` — текущий пользователь
- `POST /api/v1/auth/refresh` — обновление токена
- `POST /api/v1/auth/logout` — выход

### Listings
- `GET /api/v1/listings` — список объявлений
- `GET /api/v1/listings/:id` — детали объявления
- `POST /api/v1/listings` — создание (HOST)
- `PATCH /api/v1/listings/:id` — обновление (HOST)
- `POST /api/v1/listings/:id/publish` — публикация (HOST)
- `GET /api/v1/listings/:id/photos` — фотографии объявления
- `POST /api/v1/listings/:id/photos` — загрузка фотографии (HOST)
- `DELETE /api/v1/listings/:id/photos/:photoId` — удаление фотографии (HOST)

### Search
- `GET /api/v1/search` — поиск с фильтрами

### Bookings
- `POST /api/v1/bookings` — создание брони (GUEST)
- `GET /api/v1/bookings/:id` — детали брони
- `POST /api/v1/bookings/:id/confirm` — подтверждение (HOST)
- `POST /api/v1/bookings/:id/cancel` — отмена

### Reviews (отзывы и метрики)
- `POST /api/v1/reviews` — создать отзыв (авторизация обязательна). Тело: `{ listingId, rating (1–5), text?, metrics: [{ metricKey, value (0–100) }] }`. Ответ: `{ ok, reviewId, avg, count, distribution, percent }`.
- `GET /api/v1/reviews/listing/:listingId` — список отзывов по объявлению.
- `GET /api/v1/reviews/listing/:listingId/summary` — агрегат: `{ avg, count, distribution }`.
- Метрики на бэкенд передаются массивом `metrics: [{ metricKey: "cleanliness", value: 75 }, ...]`. Разрешённые ключи задаются в пуле на фронте (`frontend/shared/reviews/metricsPool.ts`). В форме показываются 3 случайные метрики из пула (shuffle при загрузке).

### AI (MVP)
- `POST /api/v1/ai/search` — AI-поиск
- `POST /api/v1/ai/quality` — оценка качества
- `POST /api/v1/ai/pricing` — рекомендация цены
- `POST /api/v1/ai/risk` — оценка рисков

## Роли пользователей

| Роль | Возможности |
|------|-------------|
| **Guest** | Поиск, бронирование |
| **Host** | Управление объявлениями + Guest |
| **Admin** | Полный доступ + модерация |

## Тестовые аккаунты

После выполнения `npm run db:seed`:

| Email | Пароль | Роль |
|-------|--------|------|
| guest1@locus.local | password123 | Guest |
| guest2@locus.local | password123 | Guest |
| host1@locus.local | password123 | Host |
| host2@locus.local | password123 | Host |
| admin@locus.local | password123 | Admin |

## Документация API

Swagger UI доступен по адресу: `http://localhost:4000/api/v1/docs`

## Структура проекта

```
locus-new/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Схема БД
│   │   └── seed.ts          # Seed данные
│   └── src/
│       ├── modules/
│       │   ├── auth/        # Аутентификация
│       │   ├── users/       # Пользователи
│       │   ├── listings/    # Объявления
│       │   ├── bookings/    # Бронирования
│       │   ├── search/      # Поиск
│       │   ├── ai-orchestrator/ # AI сервисы
│       │   └── prisma/      # Prisma service
│       └── main.ts
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── domains/             # Domain logic
│   │   ├── auth/           # Auth state & API
│   │   ├── listing/        # Listing components
│   │   └── search/         # Search logic
│   └── shared/             # Shared components
└── README.md
```

## Переменные окружения

### Backend (.env)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secret
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Настройка Supabase Storage

1. Создайте bucket `locus-listings` в Supabase Storage
2. Включите "Public bucket" для публичного доступа
3. Настройте политики доступа (см. `SETUP_COMPLETE.md`)

Подробные инструкции: см. `SETUP_COMPLETE.md` и `QUICK_START.md`
# LOCUS Infrastructure Architecture

## Обзор системы

LOCUS — AI-first платформа аренды недвижимости. Архитектура построена на принципе **Product Intelligence**, где каждое объявление имеет AI-профиль с оценками, прогнозами и рекомендациями.

## Диаграмма архитектуры

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                               │
│                         Deployment: Vercel                               │
│                         URL: https://locus.vercel.app                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  (public)     │    auth/      │   host/        │   admin/        │   │
│  │  - Home       │    - Login    │   - Dashboard  │   - Dashboard   │   │
│  │  - Search     │    - Register │   - Listings   │   - Moderation  │   │
│  │  - Listing    │               │   - Analytics  │   - Analytics   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS (REST API)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                                 │
│                         Deployment: Railway                               │
│                         URL: https://api.locus.app                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  API Modules:                                                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │  Auth   │ │ Users   │ │Listings │ │Bookings │ │ Search  │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                    AI BRAIN                              │    │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │   │
│  │  │  │ Quality  │ │ Pricing  │ │  Risk    │ │ Search   │   │    │   │
│  │  │  │ Strategy │ │ Strategy │ │ Strategy │ │ Strategy │   │    │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │   │
│  │  │                    ↓                                    │    │   │
│  │  │            Product Intelligence                         │    │   │
│  │  │            (AI Profile per Listing)                     │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │   │
│  │  │Analytics│ │  Admin  │ │  Files  │                           │   │
│  │  └─────────┘ └─────────┘ └─────────┘                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Prisma ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                               │
│                      Provider: Neon                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Core Tables:                AI Tables:                          │   │
│  │  - User, Profile, Role       - AiListingScore                    │   │
│  │  - Listing, ListingPhoto     - AiExplanation                     │   │
│  │  - Booking, Review           - AiEvent                           │   │
│  │  - Amenity, Availability     - AiEmbedding                       │   │
│  │                              - PropertyIntelligence              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                      FILE STORAGE                                        │
│                      Provider: Supabase Storage                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Buckets:                                                         │   │
│  │  - listing-photos/   (public)                                     │   │
│  │  - user-avatars/     (public)                                     │   │
│  │  - documents/        (private)                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Компоненты системы

### 1. Frontend (Next.js 14)

| Параметр | Значение |
|----------|----------|
| Framework | Next.js 14 (App Router) |
| Deployment | Vercel |
| State | Zustand + React Query |
| Styles | TailwindCSS |

**Структура:**
```
frontend/
├── app/
│   ├── (public)/          # Публичные страницы
│   │   ├── page.tsx       # Главная
│   │   ├── search/        # Поиск
│   │   └── listings/[id]/ # Детали объявления
│   ├── auth/              # Авторизация
│   │   ├── login/
│   │   └── register/
│   ├── host/              # Кабинет хоста
│   │   └── dashboard/
│   └── admin/             # Админ-панель
│       └── dashboard/
├── domains/               # Domain logic
├── shared/                # Shared components
└── styles/
```

### 2. Backend (NestJS)

| Параметр | Значение |
|----------|----------|
| Framework | NestJS 10 |
| ORM | Prisma |
| Auth | JWT + RBAC |
| Deployment | Railway |

**Структура модулей:**
```
backend/src/modules/
├── auth/                  # Аутентификация
├── users/                 # Пользователи
├── listings/              # Объявления
├── bookings/              # Бронирования
├── search/                # Поиск
├── ai/                    # AI модули
│   ├── ai-brain/          # Decision engine
│   │   ├── strategies/    # Стратегии расчета
│   │   └── explainers/    # Генерация объяснений
│   └── product-intelligence/  # AI профили
├── files/                 # Файловое хранилище
├── analytics/             # Аналитика
├── admin/                 # Админ функции
└── prisma/                # Prisma service
```

### 3. Database (Neon PostgreSQL)

| Параметр | Значение |
|----------|----------|
| Provider | Neon |
| Engine | PostgreSQL 15 |
| Connection | Pooled (PgBouncer) |
| Region | eu-central-1 |

**Ключевые модели:**
- `User`, `Profile`, `Role` — идентификация
- `Listing`, `Booking`, `Review` — маркетплейс
- `AiListingScore`, `PropertyIntelligence` — AI профили
- `AiEvent`, `AiExplanation` — AI логирование

### 4. File Storage (Supabase)

| Параметр | Значение |
|----------|----------|
| Provider | Supabase Storage |
| Max file size | 50MB |
| CDN | Supabase CDN |

**Buckets:**
- `listing-photos` — фото объявлений (public)
- `user-avatars` — аватары пользователей (public)
- `documents` — документы верификации (private)

---

## Environment Variables

### Backend `.env`

```env
# ===========================================
# DATABASE (Neon PostgreSQL)
# ===========================================
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# ===========================================
# FILE STORAGE (Supabase)
# ===========================================
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_BUCKET_PHOTOS=listing-photos
SUPABASE_BUCKET_AVATARS=user-avatars

# ===========================================
# AUTHENTICATION
# ===========================================
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_DAYS=30

# ===========================================
# AI CONFIGURATION
# ===========================================
AI_PROVIDER=deterministic
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-...

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=4000
CORS_ORIGINS=http://localhost:3000,https://locus.vercel.app
```

### Frontend `.env.local`

```env
# ===========================================
# BACKEND API
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
BACKEND_URL=http://localhost:4000

# ===========================================
# FILE STORAGE (Supabase - for direct uploads)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Data Flow

### 1. Listing Creation Flow

```
Host creates listing
        ↓
POST /api/v1/listings
        ↓
ListingsService.create()
        ↓
┌───────────────────┐
│   Event Emitter   │ → PropertyCreated event
└───────────────────┘
        ↓
AI Brain processes event
        ↓
┌─────────────────────────────────────┐
│     Calculate Intelligence          │
│  - qualityScore (description, etc.) │
│  - demandScore (market analysis)    │
│  - riskScore (owner, completeness)  │
│  - recommendedPrice                 │
│  - bookingProbability               │
└─────────────────────────────────────┘
        ↓
Save PropertyIntelligence
        ↓
Generate AiExplanation
        ↓
Return listing with AI profile
```

### 2. Search Flow

```
User submits search query
        ↓
GET /api/v1/search?q=...&city=...
        ↓
SearchService.search()
        ↓
┌─────────────────────────────────────┐
│         AI Search Pipeline          │
│  1. Parse intent (NLP/rules)        │
│  2. Filter (SQL WHERE)              │
│  3. Score (AI ranking)              │
│  4. Rerank (personalization)        │
│  5. Explain (why these results)     │
└─────────────────────────────────────┘
        ↓
Return {
  items: [...],
  explanation: {...},
  alternatives: [...]
}
```

### 3. Booking Flow

```
Guest creates booking
        ↓
POST /api/v1/bookings
        ↓
BookingsService.create()
        ↓
┌───────────────────┐
│   Event Emitter   │ → BookingCreated event
└───────────────────┘
        ↓
AI Brain updates:
  - demandScore (увеличение)
  - riskScore (история бронирований)
        ↓
Host receives notification
        ↓
Host confirms/rejects
```

---

## Security

### Authentication
- JWT access tokens (15 min expiry)
- Refresh tokens in httpOnly cookies
- Role-based access control (RBAC)

### Roles
| Role | Permissions |
|------|-------------|
| Guest | Search, Book, Review |
| Host | + Create/Manage listings |
| Admin | + Moderation, Analytics, Full access |

### Data Protection
- Passwords hashed with bcrypt (10 rounds)
- SQL injection prevention via Prisma
- Rate limiting on auth endpoints
- CORS whitelist

---

## Deployment

### Production URLs
| Service | URL |
|---------|-----|
| Frontend | https://locus.vercel.app |
| Backend API | https://api.locus.app |
| Swagger Docs | https://api.locus.app/api/v1/docs |
| Database | Neon Console |
| Storage | Supabase Dashboard |

### CI/CD
- **Frontend**: Vercel auto-deploy from `main` branch
- **Backend**: Railway auto-deploy from `main` branch
- **Database**: Prisma migrations via CI

---

## Monitoring

### Health Check
```
GET /api/v1/system/status

Response:
{
  "status": "ok",
  "timestamp": "2026-01-26T12:00:00Z",
  "services": {
    "backend": "ok",
    "database": "ok",
    "ai": "ok",
    "storage": "ok"
  },
  "version": "1.0.0"
}
```

### Metrics
- Request latency (P50, P95, P99)
- Error rates
- AI computation time
- Database query performance

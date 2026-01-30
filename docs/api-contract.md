# LOCUS API Contract

## Base URL

```
Development: http://localhost:4000/api/v1
Production:  https://api.locus.app/api/v1
```

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

---

## Auth Endpoints

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "guest",  // "guest" | "host"
  "name": "Иван Иванов"
}
```

**Response:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "ACTIVE",
    "roles": ["guest"],
    "profile": {
      "name": "Иван Иванов",
      "avatarUrl": null
    }
  }
}
```

### POST /auth/login

Login with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register.

### GET /auth/me

Get current user info. **Requires auth.**

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "ACTIVE",
    "roles": ["host"],
    "profile": {
      "name": "Иван",
      "avatarUrl": "https://..."
    }
  }
}
```

### POST /auth/refresh

Refresh access token using httpOnly cookie.

**Response:**
```json
{
  "accessToken": "eyJ..."
}
```

### POST /auth/logout

Logout and revoke refresh token.

**Response:**
```json
{
  "message": "Logged out"
}
```

---

## Listings Endpoints

### GET /listings

Get all published listings.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| city | string | Filter by city |
| limit | number | Max results (default: 50) |

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Квартира у метро",
      "description": "...",
      "city": "Москва",
      "basePrice": 3500,
      "currency": "RUB",
      "status": "PUBLISHED",
      "ownerId": "uuid",
      "createdAt": "2026-01-26T12:00:00Z",
      "photos": [{ "url": "...", "sortOrder": 0 }],
      "amenities": [{ "amenity": { "key": "wifi", "label": "WiFi" }}],
      "aiScores": {
        "qualityScore": 75,
        "demandScore": 68,
        "riskScore": 20
      }
    }
  ]
}
```

### GET /listings/:id

Get listing details.

**Response:**
```json
{
  "item": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "city": "Москва",
    "addressLine": "ул. Тверская",
    "lat": 55.7558,
    "lng": 37.6173,
    "basePrice": 3500,
    "currency": "RUB",
    "capacityGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "status": "PUBLISHED",
    "owner": {
      "id": "uuid",
      "profile": { "name": "Хост" }
    },
    "photos": [...],
    "amenities": [...],
    "aiScores": {...},
    "intelligence": {
      "qualityScore": 75,
      "demandScore": 68,
      "riskScore": 20,
      "bookingProbability": 0.65,
      "recommendedPrice": 3800,
      "explanation": {
        "text": "...",
        "bullets": [...],
        "suggestions": [...]
      }
    }
  }
}
```

### POST /listings

Create new listing. **Requires auth (host/admin).**

**Request:**
```json
{
  "title": "Квартира у метро",
  "description": "Уютная квартира...",
  "city": "Москва",
  "addressLine": "ул. Тверская, д. 1",
  "lat": 55.7558,
  "lng": 37.6173,
  "basePrice": 3500,
  "currency": "RUB",
  "capacityGuests": 4,
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "amenityKeys": ["wifi", "kitchen", "parking"],
  "photos": [
    { "url": "https://...", "sortOrder": 0 }
  ]
}
```

**Response:**
```json
{
  "item": { ... }  // Created listing
}
```

### PATCH /listings/:id

Update listing. **Requires auth (owner/admin).**

### POST /listings/:id/publish

Publish listing. **Requires auth (owner/admin).**

### POST /listings/:id/unpublish

Unpublish listing. **Requires auth (owner/admin).**

---

## Search Endpoints

### GET /search

Search listings with filters and AI scoring.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| city | string | City filter |
| q | string | Text query |
| priceMin | number | Min price per night |
| priceMax | number | Max price per night |
| guests | number | Min guest capacity |
| amenities | string | Comma-separated amenity keys |
| sort | string | "newest" \| "price_asc" \| "price_desc" |
| ai | "0" \| "1" | Enable AI search (default: 0) |

**Response:**
```json
{
  "items": [...],
  "ai": {
    "intent": {
      "city": "Москва",
      "maxPrice": 5000,
      "wantsQuiet": true,
      "wantsMetro": true,
      "keywords": ["тихо", "метро"]
    },
    "results": [
      {
        "listingId": "uuid",
        "relevanceScore": 85,
        "matchReasons": ["Город: Москва", "Рядом с метро"],
        "riskFlags": []
      }
    ],
    "explanation": {
      "text": "Найдено 10 вариантов...",
      "bullets": ["Город: Москва", "Бюджет: до 5000 ₽"]
    }
  }
}
```

---

## Bookings Endpoints

### POST /bookings

Create booking. **Requires auth (guest/admin).**

**Request:**
```json
{
  "listingId": "uuid",
  "checkIn": "2026-02-01T00:00:00Z",
  "checkOut": "2026-02-05T00:00:00Z",
  "guestsCount": 2
}
```

**Response:**
```json
{
  "item": {
    "id": "uuid",
    "listingId": "uuid",
    "guestId": "uuid",
    "hostId": "uuid",
    "checkIn": "2026-02-01T00:00:00Z",
    "checkOut": "2026-02-05T00:00:00Z",
    "guestsCount": 2,
    "totalPrice": 14000,
    "currency": "RUB",
    "status": "PENDING",
    "priceBreakdown": {
      "nights": 4,
      "nightly": [...],
      "subtotal": 14000
    }
  }
}
```

### GET /bookings/:id

Get booking details. **Requires auth (guest/host of this booking).**

### POST /bookings/:id/confirm

Confirm booking. **Requires auth (host).**

### POST /bookings/:id/cancel

Cancel booking. **Requires auth (guest/host).**

---

## Host Endpoints

### GET /host/intelligence

Get AI-powered dashboard data. **Requires auth (host/admin).**

**Response:**
```json
{
  "summary": {
    "totalListings": 5,
    "revenueForecast": 120000,
    "occupancyForecast": 0.72,
    "riskLevel": "low",
    "overallHealth": "good",
    "avgQuality": 68,
    "avgDemand": 55
  },
  "properties": [
    {
      "listingId": "uuid",
      "title": "Квартира у метро",
      "city": "Москва",
      "currentPrice": 3500,
      "status": "PUBLISHED",
      "intelligence": {
        "qualityScore": 75,
        "demandScore": 68,
        "riskScore": 20,
        "riskLevel": "low",
        "bookingProbability": 0.65,
        "recommendedPrice": 3800,
        "priceDeltaPercent": 8.5,
        "marketPosition": "below_market"
      },
      "explanation": {
        "text": "Отличное объявление...",
        "bullets": ["Высокое качество (75/100)", ...],
        "suggestions": ["Можно поднять цену на 8%", ...]
      }
    }
  ],
  "recommendations": [
    "2 объявления можно поднять в цене",
    "Добавьте больше фотографий"
  ]
}
```

### POST /host/intelligence/recalculate

Recalculate AI profiles. **Requires auth (host/admin).**

### GET /host/overview

Get basic dashboard stats. **Requires auth (host/admin).**

**Response:**
```json
{
  "stats": {
    "totalListings": 5,
    "publishedListings": 4,
    "totalBookings": 12,
    "pendingBookings": 2,
    "revenue30d": 45000
  },
  "recentBookings": [...]
}
```

---

## System Endpoints

### GET /system/status

Get system health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "backend": "ok",
    "database": "ok",
    "ai": "ok",
    "storage": "unknown"
  },
  "stats": {
    "users": 100,
    "listings": 50,
    "bookings": 200
  }
}
```

### GET /system/health

Simple health check for load balancers.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **guest** | Search, Book, View listings |
| **host** | + Create/Manage own listings, View intelligence |
| **admin** | + Full access, Moderation, System status |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /auth/* | 10 req/min |
| /search | 60 req/min |
| /bookings | 30 req/min |
| Other | 100 req/min |

---

## Swagger Documentation

Interactive API documentation is available at:
- Development: `http://localhost:4000/api/v1/docs`
- Production: `https://api.locus.app/api/v1/docs`

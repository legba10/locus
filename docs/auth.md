# Auth + RBAC — LOCUS Platform

## Обзор

Система аутентификации и авторизации на основе:
- **JWT Access Tokens** (15 мин, в памяти/localStorage)
- **Refresh Tokens** (30 дней, httpOnly cookie)
- **RBAC** (Role-Based Access Control)

## Роли

| Роль | Описание | Доступ |
|------|----------|--------|
| `guest` | Гость/арендатор | Поиск, бронирование |
| `host` | Арендодатель | Управление объектами, аналитика |
| `admin` | Администратор | Полный доступ к платформе |

## Backend API

### Endpoints

```
POST /api/v1/auth/register   — Регистрация (guest/host)
POST /api/v1/auth/login      — Вход
POST /api/v1/auth/refresh    — Обновление access token
POST /api/v1/auth/logout     — Выход (revoke refresh token)
GET  /api/v1/auth/me         — Текущий пользователь (требует JWT)
```

### Register

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","role":"guest","name":"Иван"}'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "ACTIVE",
    "roles": ["guest"],
    "profile": { "name": "Иван", "avatarUrl": null }
  }
}
```

Cookie: `locus_refresh` (httpOnly, 30 days)

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Refresh

```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  --cookie "locus_refresh=<token>"
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Me

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Logout

```bash
curl -X POST http://localhost:4000/api/v1/auth/logout \
  --cookie "locus_refresh=<token>"
```

## Guards (Backend)

### JwtAuthGuard

Проверяет JWT из `Authorization: Bearer <token>`.

```typescript
@UseGuards(JwtAuthGuard)
@Get("protected")
async protectedRoute(@Req() req) {
  return { userId: req.user.id };
}
```

### RolesGuard + @Roles

Проверяет роли пользователя.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("host", "admin")
@Post("listings")
async createListing() { ... }
```

## Frontend

### Auth Store (Zustand)

```typescript
import { useAuthStore } from "@/domains/auth";

const { user, login, logout, isAuthenticated, hasRole } = useAuthStore();

// Login
await login({ email: "...", password: "..." });

// Check role
if (hasRole("host")) { ... }

// Logout
await logout();
```

### Protected Routes

```tsx
import { ProtectedRoute } from "@/domains/auth";

// В layout.tsx
export default function HostLayout({ children }) {
  return (
    <ProtectedRoute roles={["host", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
```

### UserMenu Component

Автоматически показывает:
- Кнопки "Войти" / "Регистрация" для неавторизованных
- Имя пользователя + роль + кнопку "Выйти" для авторизованных

```tsx
import { UserMenu } from "@/domains/auth";

<UserMenu />
```

## Prisma Models

### User

```prisma
model User {
  id           String      @id @default(uuid())
  email        String?     @unique
  phone        String?     @unique
  passwordHash String?
  status       UserStatus  @default(ACTIVE)  // ACTIVE | BLOCKED | DELETED
  
  roles        UserRole[]
  refreshTokens RefreshToken[]
  profile      Profile?
}
```

### RefreshToken

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(...)
  
  token     String   @unique
  expiresAt DateTime
  revokedAt DateTime?
  
  userAgent String?
  ip        String?
}
```

### Role / UserRole

```prisma
model Role {
  id   String @id @default(uuid())
  name String @unique  // "guest" | "host" | "admin"
}

model UserRole {
  userId String
  roleId String
  @@id([userId, roleId])
}
```

## Environment Variables

```env
# Backend
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_EXPIRES_DAYS=30
CORS_ORIGINS="http://localhost:3000"

# Frontend
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
```

## Security

1. **Access Token**: короткоживущий (15 мин), хранится в памяти/localStorage
2. **Refresh Token**: долгоживущий (30 дней), httpOnly cookie
3. **Token Rotation**: при refresh старый токен revoke, выдаётся новый
4. **Reuse Detection**: при повторном использовании revoked токена — все токены пользователя отзываются
5. **Password Hashing**: bcrypt с cost factor 10

## Тестовые аккаунты (после seed)

| Email | Password | Role |
|-------|----------|------|
| guest1@locus.local | password123 | guest |
| guest2@locus.local | password123 | guest |
| host1@locus.local | password123 | host |
| host2@locus.local | password123 | host |
| admin@locus.local | password123 | admin |

## Checklist

- [x] JWT access + refresh tokens
- [x] httpOnly cookies
- [x] bcrypt hashing
- [x] Prisma models (User, Role, RefreshToken)
- [x] Backend endpoints (register/login/refresh/logout/me)
- [x] JwtAuthGuard + RolesGuard
- [x] @Roles decorator
- [x] Frontend auth store (zustand)
- [x] Login/Register pages
- [x] Protected routes
- [x] UserMenu component

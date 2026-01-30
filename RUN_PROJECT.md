# LOCUS — Инструкция по запуску проекта

## Требования

- Node.js 18+
- npm или pnpm
- PostgreSQL (через Supabase или локально)

---

## 1. Настройка переменных окружения

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/locus
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000
PORT=4000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1
```

---

## 2. Запуск базы данных

### Вариант A: Supabase (рекомендуется)

1. Создать проект на [supabase.com](https://supabase.com)
2. Скопировать URL и ключи в `.env` файлы
3. Выполнить миграции:

```bash
cd backend
npx prisma migrate deploy
```

### Вариант B: Локальный PostgreSQL

```bash
# Запустить PostgreSQL (если есть docker-compose)
cd backend
docker compose up -d

# Или использовать локальный PostgreSQL
npx prisma migrate dev
```

---

## 3. Запуск Backend

```bash
cd backend
npm install
npx prisma generate
npm run build
npm run start
```

Для development (с hot-reload):
```bash
npm run dev
```

**Проверка:**

```bash
curl http://localhost:4000/api/v1/health
```

Ожидаемый ответ:
```json
{"status":"ok"}
```

Backend доступен: `http://localhost:4000`

**Важно:** Если backend уже запущен, остановите его перед повторным запуском:
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force
```

---

## 4. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend доступен: `http://localhost:3000`

---

## 5. Проверка авторизации

### 5.1 Регистрация

1. Открыть `http://localhost:3000/auth/register`
2. Заполнить форму регистрации
3. Пользователь создаётся в Supabase Auth

### 5.2 Вход

1. Открыть `http://localhost:3000/auth/login`
2. Ввести email/password
3. Получить токен из Supabase session

### 5.3 Проверка /auth/me

```bash
# Получить токен из браузера (DevTools → Application → Local Storage → sb-*-auth-token)
TOKEN="eyJ..."

curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Ожидаемый ответ:**

```json
{
  "id": "uuid-prisma-user-id",
  "email": "user@example.com",
  "role": "guest",
  "roles": ["guest"],
  "supabaseId": "uuid-supabase-user-id"
}
```

---

## 6. API Контракт

### GET /api/v1/auth/me

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Response (UserContract):**
```typescript
{
  id: string           // Prisma user ID
  email: string
  role: "guest" | "host" | "admin"
  roles: string[]      // Array of roles
  supabaseId: string   // Supabase user ID
}
```

---

## 7. Типы и контракты

Единственный источник истины для типов:

```
frontend/shared/contracts/index.ts
```

Основные контракты:
- `UserContract` — пользователь
- `ListingContract` — базовый листинг
- `EnrichedListingContract` — листинг с AI-данными
- `Reason` / `ReasonType` — AI-причины

---

## 8. Проверка сборки

### Frontend

```bash
cd frontend
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npm run build       # Production build
```

### Backend

```bash
cd backend
npx prisma generate
npx tsc --noEmit    # TypeScript
npm run build       # Production build
```

---

## 9. Troubleshooting

### Ошибка: "Invalid token" на /auth/me

1. Проверить, что токен актуален (не истёк)
2. Проверить, что SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY корректны в backend
3. Убедиться, что передаётся `access_token`, а не `refresh_token`

### Ошибка: "User not found" после регистрации

1. Пользователь создаётся в Prisma при первом запросе к protected endpoint
2. Выполнить любой запрос с токеном к `/auth/me` — user синхронизируется

### CORS ошибки

1. Проверить `CORS_ORIGINS` в backend `.env`
2. Убедиться, что frontend запускается на `http://localhost:3000`

---

## 10. Checklist запуска

- [ ] `.env` файлы настроены (backend + frontend)
- [ ] Prisma миграции выполнены
- [ ] Backend запущен на порту 4000
- [ ] Frontend запущен на порту 3000
- [ ] `/api/v1/health` возвращает `{"status":"ok"}`
- [ ] Регистрация создаёт user в Supabase
- [ ] `/auth/me` возвращает UserContract

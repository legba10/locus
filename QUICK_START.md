# Быстрый старт LOCUS

## Предварительные требования

1. Node.js 18+
2. PostgreSQL (Neon или локальный)
3. Supabase аккаунт

## Шаг 1: Настройка переменных окружения

### Backend (.env)

```env
DATABASE_URL=postgresql://... (ваша строка подключения Neon)
SUPABASE_URL=https://zfarzybrjdnelujpxdtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ваш-service-role-key>
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGINS="http://localhost:3000"
```

**Где взять SUPABASE_SERVICE_ROLE_KEY:**
1. Откройте Supabase Dashboard
2. Project Settings → API
3. Найдите "service_role" key (секретный!)

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://zfarzybrjdnelujpxdtl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_BYub0ylZDb6RtuJDb3NzbA_QgEW68om
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## Шаг 2: Настройка Supabase Storage

1. Откройте Supabase Dashboard → Storage
2. Создайте bucket: `locus-listings`
3. Включите "Public bucket"
4. Настройте политики доступа (см. SETUP_COMPLETE.md)

## Шаг 3: Установка зависимостей

### Backend
```bash
cd backend
npm install
npm install @supabase/supabase-js
```

### Frontend
```bash
cd frontend
npm install
npm install @supabase/supabase-js
```

## Шаг 4: Настройка базы данных

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

Если ошибка EPERM на Windows:
```bash
# Закройте все процессы (Prisma Studio, IDE)
npx prisma generate --force
```

## Шаг 5: Запуск

### Терминал 1 - Backend
```bash
cd backend
npm run dev
```
Backend: http://localhost:4000

### Терминал 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend: http://localhost:3000

## Проверка

1. Откройте http://localhost:3000
2. Проверьте, что объявления отображаются
3. Попробуйте загрузить фотографию (требуется авторизация)

## Полезные команды

```bash
# Prisma Studio (просмотр БД)
cd backend
npx prisma studio

# Проверка подключения к БД
cd backend
npm run db:test

# Сброс БД (осторожно!)
cd backend
npm run db:reset
```

## Troubleshooting

**Backend не запускается:**
- Проверьте DATABASE_URL
- Убедитесь, что Prisma Client сгенерирован: `npx prisma generate`

**Фотографии не загружаются:**
- Проверьте SUPABASE_SERVICE_ROLE_KEY в backend/.env
- Убедитесь, что bucket `locus-listings` создан и публичный

**Ошибки Prisma:**
- Закройте Prisma Studio
- Выполните `npx prisma generate --force`

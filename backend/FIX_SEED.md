# Исправление ошибки seed

## Проблема
```
TypeError: Cannot read properties of undefined (reading 'upsert')
```

## Решение

### Шаг 1: Сгенерировать Prisma Client
```bash
cd backend
npx prisma generate
```

### Шаг 2: Выполнить seed
```bash
npm run db:seed
```

## Если ошибка сохраняется

### Вариант 1: Полный сброс
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### Вариант 2: Если база данных не настроена
```bash
cd backend
# Убедитесь, что DATABASE_URL в .env файле правильный
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

## Проверка
После успешного seed вы должны увидеть:
```
✅ Seed выполнен успешно!
```

Тестовые аккаунты будут созданы:
- `guest1@locus.local` / `password123` (пользователь)
- `host1@locus.local` / `password123` (арендодатель)
- `admin@locus.local` / `password123` (администратор)

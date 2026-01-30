# Database Setup Guide

## Quick Start

После настройки `DATABASE_URL` в `.env`:

```powershell
# 1. Генерация Prisma Client
npx prisma generate

# 2. Создание таблиц в БД
npx prisma db push

# 3. Заполнение тестовыми данными
npm run db:seed

# 4. Проверка подключения
npm run db:test

# 5. Запуск сервера
npm run dev
```

---

## Option 1: Neon.tech (Recommended)

### Why Neon?
- Free tier: 0.5 GB storage, 3 GB bandwidth/month
- Serverless (no cold starts)
- Excellent availability
- Works from any network

### Setup Steps:

1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create new project:
   - Name: `locus`
   - Region: `eu-central-1` (or closest to you)
4. Copy Connection String from dashboard

### .env Configuration:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

## Option 2: Local Docker PostgreSQL

### Prerequisites:
- Docker Desktop installed and running

### Setup:

```powershell
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps

# Check logs if issues
docker logs locus-postgres
```

### .env Configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/locus?schema=public
```

### Useful Commands:

```powershell
# Stop database
npm run docker:down

# Reset database (delete all data)
npm run docker:reset

# View database with GUI
npm run prisma:studio
```

---

## Option 3: Supabase (if network allows)

### Network Requirements:
- Disable Cloudflare WARP
- Disable VPN
- Some ISPs block direct connections

### Use Pooler URL (more reliable):

Get the pooler URL from Supabase Dashboard:
1. Go to Project Settings > Database
2. Select "Connection String" tab
3. Choose "Session pooler" method
4. Copy the URI

### .env Configuration:

```env
# Use Session Pooler (port 6543, not 5432)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# For migrations only (optional, requires direct access)
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

### Update schema.prisma for Pooler:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Optional: for migrations
}
```

---

## Troubleshooting

### Test Connection:

```powershell
npm run db:test
```

### Common Errors:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| P1001 | Can't reach server | Check network, try Neon/Docker |
| P1000 | Auth failed | Check username/password |
| P1003 | DB not exist | Create database or check URL |
| ENOTFOUND | DNS failed | Check internet, try different DNS |
| ETIMEDOUT | Connection timeout | Firewall/VPN blocking, try Neon |

### Check Network:

```powershell
# Test DNS
nslookup ep-xxx.eu-central-1.aws.neon.tech

# Test TCP connection (PowerShell)
Test-NetConnection -ComputerName HOST -Port 5432
```

---

## Production Recommendations

1. **Use connection pooling** (PgBouncer or Prisma Data Proxy)
2. **Set `sslmode=require`** for all connections
3. **Use environment-specific URLs**:
   - Development: Neon free tier or Docker
   - Staging: Neon paid or Supabase
   - Production: Supabase, Neon, or AWS RDS

4. **Keep Supabase for Storage** even if using another DB:
   - Supabase Storage works independently
   - Great for photo uploads (listings)

## LOCUS Architecture & Production Readiness Report (2026-02-07)

### TL;DR verdict (current state)
- **STABLE?**: **Частично** (билды проходят, но есть P0 риски для 1k+ нагрузки).
- **Готов к 100 онлайн**: **Да** (при нормальной DB/infra).
- **Готов к 1000 онлайн**: **Скорее нет** без P0 (rate-limit, pooling, индексы, таймауты).
- **Готов к 5000 онлайн**: **Нет** без P0+P1 (индексы, batching, caching, лимиты).
- **Готов к 10000 онлайн**: **Нет** без P0+P1+observability (и желательно Redis/queue).

---

## 1) System overview (how it works)

### Components
- **Frontend**: Next.js (App Router) `frontend/`
  - Все API вызовы идут через **Next API Proxy**: `frontend/app/api/[...path]/route.ts`
- **Backend**: NestJS + Prisma `backend/`
  - Business data в Postgres/Neon через Prisma
  - Auth/Profile живут в **Supabase** (таблица `public.profiles`)
- **Supabase**: auth.users + public.profiles (RLS + trigger)
- **DB (Prisma)**: таблицы marketplace (Listing/Booking/Favorite/AI…), TelegramAuthSession/LoginToken и т.д.

### Primary request flow
Browser → `GET/POST /api/*` (Next) → `BACKEND_URL/api/*` (Nest) → Postgres (Prisma) / Supabase (profiles)

---

## 2) Authentication architecture (critical)

### Current/desired session model (target)
- **Access token** (short-lived) + **Refresh token** (long-lived)
- **Storage**: **httpOnly cookies** (`secure`, `sameSite=Lax`, configurable `domain`)
- **Backend guards**: в основном требуют `Authorization: Bearer <supabase_access_token>`

### Findings
- Ранее Telegram auth хранил токены в **localStorage/sessionStorage**, что ломало сценарии Telegram Web → Safari и давало “session expired”.
- Next API proxy **не прокидывал cookies/Set-Cookie**, из-за чего cookie-сессии не могли работать.

### Implemented changes (in progress)
- Backend:
  - Set-Cookie на `/api/auth/telegram/complete` и `/api/auth/telegram` (widget)
  - `/api/auth/refresh` поддерживает refresh из cookie
  - `/api/auth/logout` очищает cookies
- Frontend:
  - Next proxy прокидывает `Cookie` и `Set-Cookie`
  - Если нет `Authorization`, прокси инжектит Bearer из cookie `locus_access_token`
  - Telegram completion flow больше не пишет токены в storage, добавлен таймаут 7с + retry

### Remaining auth risks (P0)
- **CSRF**: при cookie-auth важно держать `sameSite=Lax` и не принимать опасные кросс-сайт POST.
- **Cookie domain**: нужен единый корневой домен (пример: `.locus.ru`) через `COOKIE_DOMAIN`.
- **Mixed auth** (legacy storage + cookie): нужен план миграции на cookies для всех логинов (P1).

---

## 3) Backend scalability audit (NestJS/Prisma)

### P0 issues
1. **Нет rate limiting** (уязвимость к спаму/DDoS и перегрузке)
2. **Нет настройки connection pooling** для Prisma (риск исчерпания коннектов)
3. **Нет глобальных таймаутов на запросы** (подвешенные запросы съедают воркеры/коннекты)
4. **Недостаточно индексов на hot paths** (Listing/Booking/Telegram)
5. **Опасный side-effect при старте**: Telegram webhook не должен переписываться без явного флага

### Notable hotspots
- `backend/src/modules/listings/listings.service.ts`
  - create/update: amenity upsert в цикле (blocking последовательные операции)
- `backend/src/modules/search/search.service.ts`
  - нет pagination (фиксированный take=50)
  - AI search синхронно, без таймаута/fallback
- `backend/src/modules/favorites/favorites.service.ts`
  - сортировка по createdAt есть, но индекс по `(userId, createdAt)` отсутствует
- Auth:
  - `/auth/me` делает вызов в Supabase на каждый запрос → желательно кэширование/TTL (P2)

### Implemented hardening (done in code)
- **Rate limit**: глобальный throttling guard (можно настраивать через env `RATE_LIMIT_*`, health исключён)
- **Timeouts**: глобальный timeout interceptor (`REQUEST_TIMEOUT_MS`, default 30s)
- **Request logging**: requestId + latency + status (interceptor)
- **Prisma**: добавлено логирование slow queries (`PRISMA_SLOW_QUERY_MS`) и опциональная подстановка pool params (`PRISMA_POOL_SIZE/PRISMA_POOL_TIMEOUT`)
- **Telegram webhook safety**: webhook выставляется только при `TELEGRAM_SET_WEBHOOK=true` в production или при явном `TELEGRAM_WEBHOOK_URL`

---

## 4) Database (Prisma schema + migrations)

### Prisma migrations exist
`backend/prisma/migrations/*` (0..7) уже используется.

### Missing indexes (P0/P1)
**TelegramAuthSession**
- нужен индекс по `telegramUserId`, `status`, `createdAt`, `phoneNumber` + `(status, createdAt)` для уборки/поиска

**TelegramLoginToken**
- индексы по `userId`, `used`, `(userId, expiresAt)`, `(used, expiresAt)`

**Listing**
- индексы по `status`, `city`, `createdAt`, `ownerId`
- композиты: `(status, createdAt)`, `(city, status, createdAt)`, `(ownerId, status, createdAt)`

**Booking**
- индексы по `guestId`, `status`, `createdAt`
- композиты: `(guestId, createdAt)`, `(status, createdAt)`, `(hostId, status)`

**AiEvent / Review / Favorite**
- AiEvent: индексы по `userId/listingId/type/createdAt` + композиты
- Review: индекс по `authorId` + `(authorId, createdAt)`
- Favorite: индекс по `(userId, createdAt)` для сортировки списка

### Supabase profiles schema gap
Требование Telegram-данных (username/avatar/first/last) требует колонок в `public.profiles`.
Добавлена миграция: `supabase/migrations/004_profiles_add_telegram_fields.sql`.

---

## 5) Frontend stability & performance

### P0/P1 findings
1. **React Query staleTime слишком маленький** (`frontend/app/providers.tsx` `staleTime: 5000`) → частые refetch, лишняя нагрузка.
2. **DEBUG console.log** в `providers.tsx` → шум/перфоманс.
3. **Search pages**: есть признаки “много useEffect + запросы на каждый ввод” (нужен debounce и устранение loops) — особенно `SearchPageV4`.
4. **Изображения**: местами нет `sizes`/reserve space → CLS и медленная загрузка.
5. **API Proxy**: до фикса cookie-сессий не форвардил cookies/Set-Cookie (исправлено).

---

## 6) Security audit (high level)

### P0
- Cookies: должны быть `httpOnly`, `secure`, `sameSite=Lax`, `domain` настроен корректно.
- Telegram spoof: **hash verify на backend обязателен** (реализовано для widget flow).
- Rate limit: обязателен на auth/search endpoints.

### P1/P2
- Security headers (CSP, HSTS, X-Frame-Options): настроить на Next/Nest.
- Structured logging без PII, audit trail на auth actions.
- CSRF hardening: если будут cookie-auth POST endpoints — добавить CSRF token / double-submit (при необходимости).

---

## 7) Observability / Logging

### Gaps
- Нет единого requestId + latency метрик.
- Нет slow-query логов Prisma.

### Recommendations (P1)
- Nest interceptor: requestId + duration + status
- Prisma $on('query'): log slow queries > 1s
- Export metrics (Prometheus) — P2

---

## 8) Load testing plan (mandatory)

### Tooling
Рекомендовано: `autocannon` (Node) или `k6` (CLI).

### Scenarios
- 100 users: `/api/listings?limit=12`, `/api/search`, `/api/listings/:id`
- 1000 users: то же + favorites toggle (auth required)
- 5000 users: read-heavy + rate-limit validation

### Success criteria
- p95 latency: listings/search < 500–800ms (без AI), `/auth/me` < 300ms (cached)
- error rate < 0.5%
- no DB connection exhaustion

### Initial local run (evidence)
Using `backend/scripts/loadtest.js` against `http://localhost:8080` with preset **100** (10s):
- **/api/health**: ~445 req/s, p50 ~138ms (OK for baseline)
- **/api/listings?limit=12**: p50 ~7.4s, timeouts observed
- **/api/search**: p50 ~8.1s, timeouts observed

Interpretation:
- Read-heavy endpoints are currently **too slow under modest concurrency** unless DB hot-path indexes are **actually applied** to the target database and query shapes are optimized.
- The index migration was added to repo (`backend/prisma/migrations/8_add_hot_indexes`) but not applied automatically by this report.

---

## 9) Prioritized action list

### P0 (must-do before ads)
1. Rate limiting (auth/search/favorites/bookings)
2. Prisma pooling guidance + safe defaults
3. Add missing DB indexes (Telegram + listings/search + bookings)
4. Global request timeout
5. Fix React Query staleTime + remove debug logs

### P1 (scale to 5k–10k)
1. Batch amenity upserts (create/update listing)
2. Pagination for search endpoints
3. Image optimization + CLS fixes
4. Structured logging + slow query logs

### P2 (operational excellence)
1. Cache profiles/listings (Redis)
2. Queue for heavy work (AI scoring, analytics)
3. Metrics/APM + alerts


## ТЗ: LOCUS New — AI-first платформа аренды жилья (MVP 2.0)

### 1) Продуктовая модель

#### 1.1 Роли пользователей
- **Гость (Guest)**: формулирует запрос “человеческим языком”, получает подбор, объяснения, риски, бронирует.
- **Арендодатель/Хост (Host)**: ведёт объекты, получает AI-оценки качества, рекомендации по цене/спросу, алерты рисков.
- **Агент (Agency/Agent)**: управляет портфелем объектов нескольких владельцев (делегированные доступы).
- **Администратор (Admin)**: управляет правилами/финансами/доступами, наблюдаемостью, качеством платформы.
- **Модератор (Moderator)**: контент-модерация, жалобы, антифрод-эскалации.
- **AI (оркестратор + домены)**: интерпретирует намерения, ранжирует, объясняет, прогнозирует, предупреждает.

#### 1.2 Задачи платформы
- **Guest**: “не искать”, а получить **решение** (варианты + объяснение + риски + альтернативы).
- **Host**: рост загрузки и дохода через AI (цены/качество/риски/прогноз).
- **Admin/Moderator**: контроль доверия, антифрод, качество объявлений, кластеры аномалий.

#### 1.3 Ценности
- **Удобство**: один ввод → intent → готовые варианты.
- **Безопасность**: риск-скоринг, прозрачные условия, аудит.
- **AI**: объяснимость, рекомендации, прогнозирование.
- **Прозрачность**: финальная цена/условия/причины ранжирования.

---

### 2) Сценарии

#### 2.1 AI-поиск (Guest)
1) Ввод: “тихо, рядом с метро, до 50k на месяц”
2) AI: intent → кандидаты → ранжирование → объяснение “почему подходит”
3) Вывод: результаты + риски + альтернативы (расширить критерии/бюджет)

#### 2.2 Бронирование
MVP: вне фокуса (готовим домены `bookings/payments`), AI даёт предупреждения и чеклист.

#### 2.3 Публикация объявления (Host)
Создание → AI Quality Score → подсказки улучшения → публикация.

#### 2.4 Управление объектами
Хост видит **AI Dashboard**: качество, цена, спрос, риск, next-best-actions.

#### 2.5 Аналитика для хоста
MVP: базовые AI-сигналы, позже — воронка (просмотры→бронь→оплата), RevPAR/ADR.

#### 2.6 Admin управление
AI control center: risk map, quality heatmap, кластеры аномалий (позже).

---

### 3) Архитектура нового поколения (modular monolith + event-driven)

```mermaid
flowchart TB
  subgraph UX[UX Ecosystem]
    G[Guest UI (Next.js)]
    H[Host UI (Next.js)]
    A[Admin UI (Next.js)]
  end

  subgraph CORE[Core Platform (NestJS)]
    AUTH[auth/users]
    PROP[properties]
    BOOK[bookings/payments]
    MSG[messaging]
    REV[reviews]
    ADM[admin]
    AN[analytics-events]
  end

  subgraph AI[AI Intelligence Layer (NestJS domain)]
    ORCH[ai-orchestrator]
    S[ai-search]
    Q[ai-quality]
    P[ai-pricing]
    R[ai-risk]
    ASST[ai-assistant]
  end

  subgraph DATA[Data/Infra]
    PG[(PostgreSQL + Prisma + pgvector later)]
    SE[(Search engine later: OpenSearch)]
    OLAP[(Analytics later: ClickHouse/PostHog)]
    QBUS[(Queue/Event bus later)]
  end

  G --> CORE
  H --> CORE
  A --> CORE

  CORE <--> PG
  CORE --> ORCH
  ORCH --> S
  ORCH --> Q
  ORCH --> P
  ORCH --> R
  ORCH --> ASST
  ORCH <--> PG

  CORE -.events/outbox.-> QBUS
  QBUS -.index/compute.-> SE
  QBUS -.events.-> OLAP
```

**Принцип**: AI **не меняет данные напрямую**. AI возвращает рекомендации/оценки/объяснения → человек подтверждает (или применяются правилами/политиками).

---

### 4) Модель данных (AI-ready, PostgreSQL + Prisma)

#### 4.1 Core (минимум для AI MVP)
- `User`, `Profile`, `Role/Permission` (RBAC)
- `Property` (объект жилья, сигналы/метаданные)
- `Booking` (минимально)
- `AuditLog`

#### 4.2 AI сущности
- `AiProfile` — предпочтения пользователя (персонализация)
- `AiPropertyScore` — quality/risk/demand/price score (+ explanation)
- `AiExplanation` — explainability (text + bullets + meta)
- `AiEmbedding` — embeddings (MVP: `Float[]`, позже pgvector)
- `AiEvent` — события AI (логика/аудит/аналитика)

RBAC/ABAC:
- Host/Agent ограничены собственными `Property`.
- Admin/Moderator — доступ по политикам; все критичные изменения → `AuditLog`.

---

### 5) API контракты (v1)

База: `/api/v1`

#### 5.1 Health
- `GET /health` → `{ ok: true, service, version }`

#### 5.2 AI (ядро MVP 2.0)
- `POST /ai/search`
  - request: `{ query: string, context?: { userId?: string, city?: string } }`
  - response: `{ intent, results, explanation, alternatives, risks }`

- `POST /ai/quality`
  - request: `{ propertyId: string }`
  - response: `{ propertyId, qualityScore, suggestions, explanation }`

- `POST /ai/pricing`
  - request: `{ propertyId: string }`
  - response: `{ propertyId, currentPrice, recommendedPrice, deltaPct, demandScore, bookingProbability, rationale, explanation }`

- `POST /ai/risk`
  - request: `{ propertyId: string }`
  - response: `{ propertyId, riskScore, riskLevel, reasons, mitigations, explanation }`

- `POST /ai/recommendations`
  - request: `{ propertyId: string }`
  - response: `{ propertyId, actions[], signals }`

- `POST /ai/assistant`
  - request: `{ role: 'guest'|'host'|'admin', message: string, context?: {...}, extra?: {} }`
  - response: `{ reply, suggestions?, actions? }`

---

### 6) UX/UI структура (3 интерфейса)

#### 6.1 Guest UI (умный поиск)
- Главная: **AI search bar**, быстрые сценарии, рекомендации, карта
- Результаты: карточки + explanation panel “почему так”
- Карточка жилья: AI-блоки “подходит потому что…”, “риски/что уточнить”

#### 6.2 Host UI (AI Dashboard)
- Дашборд: Quality Score, Risk Level, Booking Probability, Recommended Price, next actions
- Объекты: список + качества/риски/цена
- Страница объекта: рекомендации, история изменений, “применить после подтверждения”

#### 6.3 Admin UI (AI-control center)
- Risk map (позже), очереди сигналов, heatmap качества
- Модерация: explainable решения, аудит

Mobile-first:
- нижняя навигация для Guest; для Host/Admin — боковое меню на desktop.

---

### 7) Структура репозитория (текущее состояние + целевой вектор)

```text
locus-new/
  frontend/                 # Next.js (уже есть, с mock API)
  backend/                  # NestJS + Prisma + ai-orchestrator (добавлено)
  docs/
    architecture.md         # исходный MVP-док
    tz-ai-first.md          # этот документ
```

---

### 8) Что уже реализовано в коде (минимальный working backend)

Backend:
- `GET /api/v1/health`
- Swagger: `/api/v1/docs`
- `POST /api/v1/ai/search|quality|pricing|risk|recommendations|assistant`
- Логирование AI вызовов в `AiEvent`

Prisma:
- core + AI сущности в `backend/prisma/schema.prisma`
- seed: `backend/prisma/seed.ts` (демо-объекты под запрос “тихо/метро/до 50k”)


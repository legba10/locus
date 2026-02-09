# Координация агентов — LOCUS Production Spec

**Как использовать:** перед началом работы открой этот файл и свой stage-план. Убедись, что твой этап не заблокирован и файлы не заняты другим агентом.

---

## Назначения по этапам

| Этап | Агент | Файлы/область | Статус |
|------|-------|---------------|--------|
| **1** | Agent-Listing | `frontend/components/listing/`, `frontend/domains/listing/`, `frontend/app/listings/`, `frontend/app/user/`, `backend/.../listings.service.ts` | ⬜ |
| **2** | Agent-Admin | `frontend/app/admin/`, `backend/.../admin/` | ⬜ |
| **3** | Agent-Chat | `frontend/app/messages/`, чат-компоненты, Supabase realtime, `backend/.../messages/`, `backend/.../conversations/` | ⬜ |
| **4** | Agent-Notifications | уведомления, push, service worker, `backend/.../notifications/` | ⬜ |
| **5** | Agent-Auth | auth, login, User-модель, `backend/.../auth/`, `frontend/.../auth/` | ⬜ |
| **6** | Agent-Design | `frontend/` globals, токены, общие компоненты — **после 1–5** | ⬜ |
| **7** | Agent-Bugs | listing, admin, not-found, мобильная — **после 1, 2, 6** | ⬜ |
| **8** | Agent-Cleanup | удаление лишнего — **только после 1–7** | ⬜ |

---

## Зоны ответственности (кто что трогает)

### Agent-Listing (Этап 1)
- `frontend/components/listing/*`
- `frontend/domains/listing/*`
- `frontend/app/listings/*`
- `frontend/app/user/[id]/*`
- `frontend/core/i18n/ru.ts` (только строки цены/листинга)
- `frontend/shared/reviews/*`
- `backend/src/modules/listings/listings.service.ts` (getById, listingsCount)

### Agent-Admin (Этап 2)
- `frontend/app/admin/*`
- `backend/src/modules/admin/*`

### Agent-Chat (Этап 3)
- `frontend/app/messages/*` и связанные компоненты чата
- Supabase realtime-подписки
- `backend` — messages, conversations, логика создания после брони

### Agent-Notifications (Этап 4)
- компоненты уведомлений, колокольчик
- service worker, Web Push, VAPID
- `backend` — notifications, push-подписки

### Agent-Auth (Этап 5)
- страницы/компоненты логина (Telegram, email, phone)
- модель User, привязка идентичностей
- `backend` — auth, users

### Agent-Design (Этап 6)
- `frontend` — globals.css, design tokens, общие компоненты
- **Не переписывать** логику этапов 1–5, только стили/токены

### Agent-Bugs (Этап 7)
- `frontend/app/not-found.tsx`
- listing, admin, поиск — **только фиксы багов**, без рефактора
- мобильная вёрстка

### Agent-Cleanup (Этап 8)
- удаление старых listing-версий (V3–V7), мусорных компонентов
- очистка импортов и маршрутов

---

## Зависимости и порядок

- **1, 2, 3, 4, 5** — можно делать **параллельно** (разные файлы)
- **6** — лучше после 1–5, иначе Design может перезатереть правки
- **7** — после 1, 2, 6
- **8** — последний

---

## Правила для агентов

1. **Перед работой:** прочитай `.cursor/plans/AGENT_COORDINATION.md` и свой `stage-N-*.plan.md`.
2. **Файлы:** меняй только файлы своей зоны. Если нужен чужой файл — оставь TODO или согласуй.
3. **Статус:** после деплоя этапа отметь его выполненным в этом файле (⬜ → ✅).
4. **Конфликты:** этапы 1–5 не пересекаются по файлам; при сомнении — не трогай.

---

## Быстрый старт для агента

Скажи агенту: *«Работай по этапу N. Читай .cursor/plans/AGENT_COORDINATION.md и stage-N-*.plan.md. Меняй только файлы своей зоны.»*

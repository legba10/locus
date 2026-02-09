# Этап 3 — ЧАТ (Agent-Chat)

**Координация:** читай [AGENT_COORDINATION.md](./AGENT_COORDINATION.md). Меняй только файлы зоны Agent-Chat.

---

## Твоя зона

- `frontend/app/messages/*` и компоненты чата
- Supabase realtime-подписки
- `backend` — messages, conversations

---

## Задачи

### 1. Supabase Realtime
- Подписка на канал по conversationId
- При отправке: insert в БД + broadcast по realtime
- Использовать существующие таблицы сообщений

### 2. Авто-чат после брони
- При создании/подтверждении брони — создать conversation гость ↔ владелец (если нет)
- Редирект/ссылка в «Мои брони» на чат

### 3. Страница сообщений
- `frontend/app/messages` (или текущий маршрут)
- Список чатов + выбранный чат
- Обновление в реальном времени

---

## Результат

build → push → deploy. Отметить этап в AGENT_COORDINATION.md.

# Этап 4 — УВЕДОМЛЕНИЯ (Agent-Notifications)

**Координация:** читай [AGENT_COORDINATION.md](./AGENT_COORDINATION.md). Меняй только файлы зоны Agent-Notifications.

---

## Твоя зона

- Компоненты уведомлений, колокольчик
- Service worker, Web Push, VAPID
- `backend` — notifications, push-подписки

---

## Задачи

### Web Push
- VAPID keys, service worker
- Подписка в БД

### Админ
- Расширить механизм рассылки: push всем подписчикам

### In-app
- Уже есть; при необходимости — единый список, отметка «прочитано»

---

## Результат

build → push → deploy. Отметить этап в AGENT_COORDINATION.md.

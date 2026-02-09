# Этап 5 — AUTH (Agent-Auth)

**Координация:** читай [AGENT_COORDINATION.md](./AGENT_COORDINATION.md). Меняй только файлы зоны Agent-Auth.

---

## Твоя зона

- Страницы/компоненты логина (Telegram, email, phone)
- Модель User, привязка идентичностей
- `backend` — auth, users

---

## Задачи

### Связать аккаунты
- Telegram + email + phone → **один User**
- Привязка telegram_id / email / phone к одному User
- Логин по любому способу → один профиль
- Не создавать новые сущности — расширить User и логику входа

### Phone login
- Минимальный поток (код по SMS или заглушка «в разработке»)

---

## Результат

build → push → deploy. Отметить этап в AGENT_COORDINATION.md.

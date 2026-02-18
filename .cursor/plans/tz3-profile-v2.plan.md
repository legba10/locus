# ТЗ 3 — Система профиля и настроек пользователя (Account System v2)

## Цель
Полноценная система аккаунта уровня Airbnb/Cian: структура из 6 вкладок, без перегруза, базовые вещи (пароль, безопасность, выплаты, верификация). Без удаления backend.

## Статус

| Часть | Описание | Статус |
|-------|----------|--------|
| 1 | Архитектура: 6 вкладок (Основное, Безопасность, Уведомления, Платежи, Документы, Настройки) | ✅ |
| 2 | Основное: пользователь (аватар, имя, телефон, email), кнопка Редактировать (модал), статус аккаунта, роль | ✅ |
| 3 | Безопасность: смена пароля, подтверждение email/телефона, сессии | ✅ |
| 4 | Уведомления: toggle list (сообщения, бронирования, отклики, системные) | ✅ |
| 5 | Платежи: UI-заглушка (баланс, метод выплат, добавить карту, история) | ✅ |
| 6 | Документы: паспорт, фото лица, номер — статусы не загружено/проверяется/подтверждено | ✅ |
| 7 | Настройки интерфейса: тема, язык; тема только здесь | ✅ |
| 8 | UI: карточки radius 16, padding 20, glass; отступы 24px; заголовки 600 | ✅ |
| 9 | Исправления: дубли кнопок, контраст тарифов, сетка полей | ✅ |
| 10 | Mobile: вкладки как accordion | ✅ |
| 11 | Компоненты: ProfileLayoutV2, ProfileSidebar, ProfileCard, SecurityBlock, PaymentsBlock, DocsBlock | ✅ |
| 12 | Не ломать backend/API/auth | ✅ |

## Маршруты
- `/profile` — Основное
- `/profile/security` — Безопасность
- `/profile/notifications` — Уведомления
- `/profile/payments` — Платежи
- `/profile/docs` — Документы
- `/profile/settings` — Настройки интерфейса

## Файлы
- `frontend/config/uiFlags.ts` — useProfileV2
- `frontend/app/profile/layout.tsx` — layout с сайдбаром (при useProfileV2)
- `frontend/components/profile/ProfileLayoutV2.tsx`, `ProfileSidebar.tsx`, `ProfileCard.tsx`
- `frontend/components/profile/SecurityBlock.tsx`, `PaymentsBlock.tsx`, `DocsBlock.tsx`
- `frontend/app/profile/page.tsx`, `profile/security/page.tsx`, … `profile/settings/page.tsx`
- Тема: только в Profile → Настройки (скрыть в футере/хедере при useProfileV2)

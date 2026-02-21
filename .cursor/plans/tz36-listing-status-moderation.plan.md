# TZ-36 — Единая система статусов и модерации

## Цель
Синхронизировать БД/API/UI по единой модели статусов объявления и убрать ложные состояния модерации.

## Шаги
- [x] Backend: добавить поля `moderation_note`, `published_at`, `rejected_at` в `listings` (Prisma + migration).
- [x] Backend: внедрить каноническое отображение статусов (`draft|moderation|published|rejected|archived`) и переходы.
- [x] Backend: добавить `PATCH /listings/:id/status` (admin-only) + защита от ручной публикации владельцем.
- [x] Frontend: обновить страницу объявления (владелец/админ) по каноническому статусу.
- [x] Frontend: обновить бейджи и статусы в кабинете (`/profile/listings`).
- [x] Sync: после смены статуса — invalidate/refetch.
- [x] Проверка линтеров и commit + push.

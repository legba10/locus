# TZ-38 — Полная аналитика объявления

## Цель
Добавить реальную owner/admin аналитику внутри страницы объявления: метрики, график, AI-блок и источники трафика, без поломки текущего UX.

## Шаги
- [x] Backend: добавить `listing_stats` в Prisma + migration.
- [x] Backend: реализовать API чтения метрик и инкрементов (`views/favorites/messages/bookings`) + reset для админа.
- [x] Frontend: подключить инкременты событий (open/favorite/write/book) и троттлинг `views` 30 минут через localStorage.
- [x] Frontend: добавить полноценный блок аналитики во вкладке объявления для owner/admin.
- [x] Frontend: добавить график активности (7/30) на `recharts`.
- [x] Проверить lints.
- [ ] Выполнить commit/push по ТЗ-38.

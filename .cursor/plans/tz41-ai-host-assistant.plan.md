# TZ-41 — AI-помощник для владельца объявления

## Цель
Добавить AI-помощника арендодателя (mock), доступного только в режиме управления объявлениями (владелец/админ), без изменений базовой архитектуры карточек, навигации и модерации.

## Шаги
- [x] Добавить mock-движок `frontend/lib/ai/hostAnalyzer.ts` (analyzeListing, suggestPrice, improveDescription).
- [x] Добавить store `frontend/core/aiHost/aiHostStore.ts` для анализа/рекомендаций/выбранных подсказок.
- [x] Реализовать side panel `frontend/components/ai/AiHostPanel.tsx` с 4 вкладками.
- [x] Встроить кнопку `AI-помощник` в `frontend/app/profile/listings/page.tsx` (мои объявления).
- [x] Встроить `AI-помощник` в страницу объявления для owner/admin (`frontend/domains/listing/ListingPageTZ8.tsx`).
- [x] Проверить, что панель не показывается обычному пользователю и на главной/поиске.
- [x] Проверить lints изменённых файлов.
- [ ] Commit + push с сообщением ТЗ-41.

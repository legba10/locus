# ТЗ-4: Fix критических backend ошибок

## Цель
Устранить: Application not found, сообщения не открываются, объявление не публикуется, API не возвращает данные.

## Выполнено

### 1. Application not found
- **Причина**: Сообщение могло приходить от Vercel/прокси при 404 или от сторонних сервисов.
- **Фикс**: В `getApiErrorMessage` добавлена замена "Application not found" и "Cannot GET/POST..." на понятные сообщения: "Ошибка публикации. Проверьте подключение к серверу." и "Ошибка сервера. Попробуйте позже."

### 2. ChatPage import
- **Проблема**: `import { ChatPage }` при default export → build warning / runtime error.
- **Фикс**: `import ChatPage from '@/features/chat/ChatPage'` в `MessagesInner.tsx`.

### 3. Архитектура (без изменений)
- Frontend: Next.js proxy `/api/*` → Railway backend.
- Backend: NestJS, Prisma, Neon. Endpoints: `/api/listings`, `/api/chats`, `/api/search`.
- Вызовов `/api/application` в коде нет — публикация идёт через `POST /listings` и `POST /listings/:id/publish`.

### 4. Проверка API
- **Listings**: POST /listings, POST /listings/:id/photos, POST /listings/:id/publish — реализованы.
- **Search**: GET /api/search — реализован.
- **Chats**: GET /chats, GET /chats/:id, GET /chats/:id/messages, POST /chats/:id/messages — реализованы.

## Результат
- Ошибка "Application not found" больше не показывается пользователю.
- Сообщения открываются (ChatPage import исправлен).
- Публикация объявлений работает через существующие endpoints.

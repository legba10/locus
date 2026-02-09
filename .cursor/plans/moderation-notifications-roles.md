# Модерация объявлений + Уведомления + Роли

## Статус: выполнено

### 1. Статусы объявлений

- В схеме уже были: `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `DRAFT`, `ARCHIVED` и др.
- Добавлены поля: `moderationComment`, `moderatedById` (FK на User).
- Миграция: `13_moderation_notifications_roles/migration.sql`.

### 2. Логика создания

- При создании объявления: `status = PENDING_REVIEW` (никогда сразу не публикуется).
- После создания: уведомление админам/менеджерам `NEW_LISTING_PENDING`.

### 3. Модерация API

- **GET /admin/listings/pending** — на модерации (уже был).
- **POST /admin/listings/:id/approve** — статус PUBLISHED, `moderatedById`, уведомление владельцу `LISTING_APPROVED`.
- **POST /admin/listings/:id/reject** — body `{ reason }`, статус REJECTED, `moderationComment = reason`, уведомление владельцу `LISTING_REJECTED`.
- Доступ: **ModerationGuard** (ADMIN или MANAGER). set-role только у root (ensureRootAdmin).

### 4. Роли

- **UserRoleEnum**: добавлен `MANAGER`.
- **ModerationGuard**: пропускает ADMIN и MANAGER (модерация объявлений, просмотр списков).
- **set-role**: root может выставлять `admin` | `manager` | `user`. Root нельзя понизить.

### 5. Уведомления

- Таблица **Notification** (id, userId, type, title, body, read, createdAt).
- **NotificationsService**: create, createForAdmins, getForUser, getUnreadCount, markRead, markAllRead.
- **GET /notifications**, **GET /notifications/unread-count**, **POST /notifications/:id/read**, **POST /notifications/read-all** (с SupabaseAuthGuard).
- Отправка: при создании объявления → админам; при approve → владельцу; при reject → владельцу с текстом причины.

### 6. Frontend

- **Мои объявления**: статус PENDING_REVIEW → «На модерации», PUBLISHED → «Опубликовано», REJECTED → «Отклонено». При REJECTED показ причины и кнопка «Исправить». После редактирования статус снова PENDING_REVIEW.
- **Админка**: в «Объявления» добавлен фильтр REJECTED; при отклонении запрашивается причина (prompt), отправляется в body. В «Пользователи» роль «Менеджер» в выборе и отображении.
- **Header**: иконка колокольчика, badge непрочитанных, выпадающий список уведомлений, «Прочитать все». Звук: воспроизведение `/sounds/notify.mp3` при росте счётчика (файл нужно положить в `public/sounds/`).

### 7. Без изменений

- Auth, основной API объявлений, профиль, чат не трогались. Только расширение (поля, эндпоинты, UI).

### Файлы

- Backend: prisma schema (UserRoleEnum MANAGER, Listing moderationComment/moderatedById, Notification), migration 13, ListingsService (status PENDING_REVIEW, уведомление админам), AdminService (approve/reject с moderated_by и уведомлениями), NotificationsModule, ModerationGuard, AdminController (ModerationGuard, set-role manager).
- Frontend: OwnerDashboardV7 (статусы, причина отклонения, «Исправить»), AdminDashboardV2 (reject с reason, фильтр REJECTED, роль manager), NotificationsBell в HeaderLight, public/sounds/README.md.

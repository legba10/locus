# TZ-74 — CHAT 2.0 (полная пересборка чата)

## Цель
Чат читаемый, имя + объявление всегда видно, сообщения как в Telegram/Avito, строгая архитектура, без inline CSS.

## Статус: ✅ Выполнено

### Сделано
- [x] Структура `/features/chat`: ChatPage, ChatHeader, ChatMessage, ChatInput, ChatLayout, chat.types.ts
- [x] Типы: ChatUser, ChatAd, ChatMessageType
- [x] ChatLayout: header / messages / input, chat.module.css (100vh, flex, только messages скролл)
- [x] ChatHeader: user + ad, опционально onBack (кнопка «Назад»), chatHeader.module.css
- [x] ChatMessage: пузырь max-width 75%, mine/чужой через CSS, chatMessage.module.css
- [x] ChatInput: контролируемый input + кнопка, chatInput.module.css
- [x] ChatPage: загрузка/отправка через API, интеграция с MessagesInner (user, ad из выбранного чата)
- [x] Удалён старый чат: `modules/chat` (все файлы), soundController перенесён в `shared/chatSound.ts`
- [x] Удалены импорты стилей: chat-tz58.css, tz64-chat.css из globals.css

### Правила (соблюдены)
- Чат 100vh, header и input фиксированы, скролл только в messages
- Без position: absolute, без случайных отступов, max-width пузыря 75%
- Только CSS-модули и переменные (--bg-primary, --border-primary, --bg-secondary, --primary, --text-primary и т.д.)

## Дальше
ТЗ-75 — Router + Opening Listings Fix.

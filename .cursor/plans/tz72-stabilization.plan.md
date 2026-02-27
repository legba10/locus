# TZ-72: STABILIZATION PHASE — Архитектурная перезагрузка UI

## Цель
Остановить хаос: смешение тем, разный размер кнопок, кривые отступы, сломанные сообщения/объявления, конфликт слоёв.

## Выполнено

### Block 1 — Жёсткая изоляция тем
- [x] Корневые классы `html.theme-light` / `html.theme-dark` в ThemeProvider и в layout init script
- [x] Файл `theme-isolation-tz72.css` с токенами для theme-light/theme-dark
- [x] Запрет жёстких #fff/#000: профиль и карточки переведены на var(--bg-card), var(--text-primary)

### Block 8 — Тёмная тема
- [x] В dark: `--bg-card: #12182b`, `--card: #12182b`, `--bg-main: #0f1425`
- [x] theme.css и theme-isolation-tz72: селекторы html.theme-dark, [data-theme="dark"], .dark
- [x] home-filter-block-tz-final, profile-page, profile-item — фон через var(--bg-card)
- [x] Сообщения чата .message.received — background: var(--bg-card)

### Block 4 — Объявления
- [x] Route `/listings/[id]` есть, PageClient читает id из useParams
- [x] Добавлен лог `console.log('Opening listing:', id)` для отладки

### Block 3 — Сообщения
- [x] Вместо `return null` при !mounted — показ спиннера (снижает риск React error #380)
- [x] Пузыри сообщений: padding 12px 16px, max-width 75%, border-radius 18px; received через var(--bg-card)

### Block 6 — Сетка
- [x] Переменные `--content-max-width: 720px`, `--block-gap: 24px`
- [x] Класс `.content-shell-tz72`: max-width 720px, padding 16px, дочерние блоки + margin-top 24px

## В работе / далее
- Block 2: унификация кнопок (Primary/Secondary 52px, Small 40px, Icon 44px)
- Block 5: карта — API ключ, домен, ymaps.geocode
- Block 7: единый компонент MenuItem
- Block 9: заморозка дизайна, аудит, UI-kit

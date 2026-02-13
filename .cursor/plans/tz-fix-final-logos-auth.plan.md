# ТЗ-FIX-FINAL: логотипы + auth-цикл

## Статус: выполнен

### 1. PUBLIC
- Удалены: `favicon-16.svg`, `favicon-32.svg`, файлы в `lottie/` и `sounds/` (lottie восстановлены минимальными JSON — компоненты их импортируют).
- Оставлены/проверены: `logo-dark.svg`, `logo-light.svg`, `logo-icon.svg`, `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`, `manifest.json`. Файлов `logo.png`, `logo-drak.svg`, `logo-locus*.png` в репо не было.

### 2. HEADER
- Один логотип: `/logo-dark.svg`, без смены по теме.
- Ссылка логотипа: `href="/search"` (избегаем цикла логотип → / → auth → login → /).
- Добавлен `<span>LOCUS</span>` рядом с картинкой.
- Удалены использование `ThemeContext`/`resolvedTheme` для логотипа.

### 3. MANIFEST
- `site.webmanifest`: одна иконка `/logo-icon.svg`, `sizes: "192x192"`, `type: "image/svg+xml"`.
- `manifest.json`: уже с `/logo-icon.svg` (без PNG).

### 4. AUTH LOOP
- `shared/api/client.ts`: введён глобальный `isRefreshing` и `refreshPromise`; при 401 только один одновременный вызов refresh, остальные ждут тот же promise.
- `domains/auth/auth-store.ts`: в `initialize()` при 401 не делаем ретраи (сразу выходим из цикла), чтобы не плодить повторные refresh.

### 5. После деплоя
- `git add . && git commit -m "final fix: logo paths + auth loop + manifest" && git push`
- В Vercel: Redeploy → Clear cache → Deploy.

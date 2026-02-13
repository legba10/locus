# ТЗ-9: Финальная стабилизация + логотипы + подготовка к пушу

## Статус: выполнено

### 1. Логотипы в /public
- [x] `favicon.svg` — создан (копия favicon-32.svg)
- [x] `logo.png` — создан (копия logo-locus-icon.png)
- [x] `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` — созданы
- [x] Используются имена: favicon.ico, favicon.svg, apple-touch-icon.png, logo.png, manifest-иконки

### 2. Код — единый путь /logo.png
- [x] Header.tsx — `/logo.png`, fallback `/favicon.ico`
- [x] HeaderLight.tsx — `/logo.png`
- [x] Auth (RegisterPageV5) — компонент Logo (текст), без img
- [x] Loader — Lottie, без логотипа
- [x] Manifest — пути `/web-app-manifest-192x192.png`, `/web-app-manifest-512x512.png`

### 3. layout.tsx и manifest
- [x] layout: link favicon.ico, favicon.svg, apple-touch-icon
- [x] manifest.json: icons 192x192, 512x512 с корректными путями
- [x] site.webmanifest приведён к LOCUS

### 4. Редирект при 401 (п.6 ТЗ-9)
- [x] AuthProvider: при 401 только `logout()`, без редиректа на /auth/login
- [x] Редирект на логин только из ProtectedRoute и явных ссылок «Войти»

### 5. Сборка
- [x] `npm run build` — успешно, без ошибок и missing assets

### 6. Service worker
- sw.js в public не найден; регистрация в NotificationsBell — при появлении sw исключить кэш логотипов при необходимости.

### 7. Коммит
- Сообщение: `fix: final stabilization + logo paths + build check`
- Затем push.

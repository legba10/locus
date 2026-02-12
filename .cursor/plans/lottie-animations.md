## План: Lottie reactions (stable)

## Статус: выполнен

### Цель

Реакции интерфейса на `location/check/Loading/Error` без роботов и без fullscreen/overlay.

### Сделано

1. Созданы компоненты в `frontend/components/lottie/`:
   - `SearchIcon.tsx` (hover/tap/click play once, mobile-safe)
   - `TelegramStatus.tsx` (`check.json`)
   - `Loader.tsx` (`Loading.json`)
   - `ErrorAnim.tsx` (`Error.json`)
2. Search-кнопки переведены на `SearchIcon`:
   - `frontend/app/HomePageV6.tsx`
   - `frontend/domains/search/SearchBar.tsx`
   - `frontend/domains/search/SearchBarAdvanced.tsx`
   - `frontend/app/search/SearchPageClient.tsx`
3. Telegram flow:
   - `frontend/app/auth/login/PageClient.tsx` (кнопка Telegram + submit loading)
   - `frontend/app/auth/telegram/complete/page.tsx` (loading/success/error)
4. Error/empty:
   - `frontend/app/not-found.tsx`
   - `frontend/app/search/SearchPageClient.tsx`
5. Удалены старые UI Lottie-обертки:
   - `frontend/components/ui/LottieIcon.tsx`
   - `frontend/components/ui/Loader.tsx`

### Ограничения

- Используются строго:
  - `frontend/public/lottie/location.json`
  - `frontend/public/lottie/check.json`
  - `frontend/public/lottie/Loading.json`
  - `frontend/public/lottie/Error.json`
- Dynamic import применяется в каждом компоненте Lottie.
- Для `location.json`: `loop={false}`, `autoplay={false}`, запуск только по interaction.

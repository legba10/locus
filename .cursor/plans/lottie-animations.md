## План: Lottie-анимации (production stable)

## Статус: выполнен

## Цель

Перейти на стабильный набор анимаций из `frontend/public/lottie/` без fullscreen/overlay и без legacy-роботов.

## Сделано

1. **База**
   - Добавлены компоненты:
     - `frontend/components/ui/LottieIcon.tsx` (dynamic import `lottie-react`, поддержка `playOnHover`)
     - `frontend/components/ui/Loader.tsx` (inline loader на `Loading.json`)
2. **Search (location.json)**
   - Подключено в кнопки поиска:
     - `frontend/app/HomePageV6.tsx`
     - `frontend/domains/search/SearchBar.tsx`
     - `frontend/domains/search/SearchBarAdvanced.tsx`
     - `frontend/app/search/SearchPageClient.tsx`
   - Режим: `loop={false}`, `autoplay={false}`, запуск по hover.
3. **Check (Telegram + success)**
   - `frontend/app/auth/login/PageClient.tsx`: кнопка "Войти через Telegram".
   - `frontend/app/auth/telegram/complete/page.tsx`: success state.
   - Emoji check удален.
4. **Loading (inline only)**
   - `frontend/app/auth/login/PageClient.tsx`: submit loading.
   - `frontend/app/auth/telegram/complete/page.tsx`: loading + Suspense fallback.
   - `frontend/app/search/SearchPageClient.tsx`: загрузка результатов.
5. **Error (ошибки/пусто)**
   - `frontend/app/not-found.tsx`.
   - `frontend/app/search/SearchPageClient.tsx`: network error + empty results.
6. **Удалено legacy**
   - `frontend/components/mascot/HomeAiButtonRobot.tsx`
   - `frontend/components/mascot/AiMascot.tsx`
   - `frontend/components/robot/LoginButtonRobot.tsx`
   - `frontend/components/robot/LoginRobotView.tsx`
   - `frontend/components/robot/LoginRobotController.tsx`
   - `frontend/components/ErrorAnim.tsx`
   - `frontend/components/AIBubble.tsx`

## Ограничения соблюдены

- Без fullscreen loader/overlay/fixed loader.
- Используются только:
  - `check.json`
  - `Error.json`
  - `Loading.json`
  - `location.json`
# План: Lottie-анимации (LOCUS)

## Статус: выполнен

## Сделано

1. **Зависимость** — `lottie-react` в `package.json` (уже была).
2. **Конфиг** — `frontend/config/animations.ts`: `ENABLE_ANIMATIONS = true` (feature-flag).
3. **Компоненты** (ленивая загрузка JSON через `fetch`, без SSR):
   - `GlobalLoader.tsx` — bubble, fullscreen при инициализации auth.
   - `MobileBubble.tsx` — bubble, только мобильный, фикс. позиция.
   - `AIBubble.tsx` — ai.json в кнопке AI.
   - `HeroFlow.tsx` — flow в hero главной.
   - `ErrorAnim.tsx` — error на 404.
4. **Подключения**:
   - GlobalLoader в `AuthProvider`: показ при `!isInitialized`.
   - MobileBubble на страницах логина и регистрации.
   - HeroFlow и AIBubble на главной (`HomePageV6`).
   - ErrorAnim на 404 (`not-found.tsx`) через `dynamic(..., { ssr: false })`.
5. **Файлы анимаций** в `public/lottie/`: используются как есть (`Buuble.json`, `Flow 1.json`, `Error.json`, `ai.json`).

## Отключение

В `config/animations.ts` выставить `ENABLE_ANIMATIONS = false` — все анимации перестанут рендериться.

## Коммит и пуш

- Сообщение: `feat: lottie animations подключены (loader, mobile bubble, ai, flow, error)`

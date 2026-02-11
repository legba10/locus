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

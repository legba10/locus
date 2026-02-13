# TZ-8: Логотип + бургер + изображения объявлений

## Status
completed

## Done
1. **Логотип**: В `shared/ui/Logo.tsx` добавлен default export `LogoImg()` с `useTheme()`; в Header используется `<LogoImg />` внутри `<Link href="/">`. Пути только `/logo-light.svg` и `/logo-dark.svg`. В public есть logo-light.svg, logo-dark.svg (logo.svg, logo1.png, logo-new.png не найдены — удалять нечего).
2. **Бургер**: Overlay `.menu-overlay` поднят до z-index 9999 (выше header 100), drawer остаётся 10050. Кнопка уже вызывает `setMenuOpen(true)`, закрытие — overlay/крестик/ESC.
3. **Логин**: На странице входа добавлен ref `hasRedirected` — редирект на `/` выполняется один раз при наличии user. В `components/ProtectedRoute.tsx` добавлена проверка pathname: не редиректить с `/auth/login` и `/auth/register`.
4. **Фото объявлений**: В `ListingCard` контейнер изображения — `h-[240px]`, изображение с `object-cover`. В `listing-card-tz6.css` убран aspect-ratio/max-height у `.listing-card__image-wrap`.
5. **Фильтр на главной**: Блоку поиска на главной добавлены классы `max-w-5xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm`.

## Files
- frontend/shared/ui/Logo.tsx
- frontend/components/layout/Header.tsx
- frontend/styles/globals.css
- frontend/styles/listing-card-tz6.css
- frontend/components/listing/ListingCard.tsx
- frontend/app/auth/login/PageClient.tsx
- frontend/app/HomePageV6.tsx
- frontend/components/ProtectedRoute.tsx

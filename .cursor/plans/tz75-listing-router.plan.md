# TZ-75 — LISTING ROUTER FIX (открытие объявления)

## Цель
Любое объявление открывается по `/listing/[id]`, без undefined id, без hydration ошибок, без «Что-то пошло не так», корректная загрузка, 404 и error boundary.

## Статус: ✅ Выполнено

### Сделано

1. **Маршрут `/app/listing/[id]/`**
   - **page.tsx** — async Server Component: проверка `id`, серверный `getListing(id, cookie)` через `NEXT_PUBLIC_API_URL/api/listings/:id`, при отсутствии id или listing — `notFound()`.
   - **ListingDetailClient** — клиентский компонент: принимает `id` и `initialListing`, рендерит `ListingPageTZ8` с `initialListing` (или `ListingPageLight` без серверных данных).

2. **Загрузка без useEffect**
   - Первичные данные — только на сервере. Ответ передаётся в `ListingPageTZ8` как `initialListing`; `useFetch` вызывается с `initialData: initialListing`, без лишнего запроса при первом рендере.

3. **loading.tsx** — состояние «Загрузка...» для слота.

4. **error.tsx** — Error Boundary: «Ошибка загрузки объявления» + ссылка «Вернуться к поиску».

5. **not-found.tsx** — кастомная 404: «Объявление не найдено» + ссылка на `/listings`.

6. **Редирект**
   - `/listings/[id]` → редирект на `/listing/[id]`. Удалены старые `PageClient.tsx` и `ListingPage.tsx` из `app/listings/[id]/`.

7. **Ссылки на объявление**
   - Все переходы на страницу объявления переведены на `/listing/`: карточки (ListingCard, ListingCardTZ7, TZ13, V2, ListingCardLight, ListingCardCabinetV2, PropertyCard), BookingCard, ChatPanel, ReviewWizard, CreateListingWizardV2, DashboardV2, AdminDashboardV2, admin/ai, ReviewReminderPopup, ListingPageTZ8 (внутренние переходы и redirect после логина), ListingPageV3/V2/V2TZ1 (redirect после логина). API-пути (`/api/listings/...`, `/admin/listings/...`) не менялись.

8. **BottomNav**
   - Учёт страницы детализации и по `/listing/[id]`, и по `/listings/[id]` (для старых ссылок после редиректа).

### Проверки по ТЗ
- Переход с карточки: `Link href={/listing/${id}}` или `router.push(/listing/${id})`.
- Прямой заход `/listing/:id` и обновление страницы: серверный fetch, при отсутствии данных — 404.
- Нет первичной загрузки через useEffect на странице объявления (данные с сервера).
- 404: `notFound()` + `not-found.tsx`.
- Error boundary: `error.tsx`.
- Loading: `loading.tsx`.

### Запреты (соблюдены)
- Нет try/catch без обработки (в getListing ошибка → return null → notFound).
- Нет silent ошибок (notFound при отсутствии данных).
- Нет undefined в JSX (id и listing проверяются до рендера).
- Нет useEffect для первичной загрузки листинга на странице.

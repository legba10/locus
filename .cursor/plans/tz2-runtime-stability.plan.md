# TZ-2: Критические runtime-ошибки и стабилизация клиента

**Приоритет:** максимальный. Блокирует: стабильность, деплой, оплату.

---

## Цель

Сайт не падает ни при каких условиях (null API, 401, пустой массив).

---

## Статус задач

| # | Задача | Статус |
|---|--------|--------|
| 1 | React #418: ключи в списках (key=item.id) | ✅ listing.id, chat.id, c.id; скелеты key=i допустимы |
| 2 | React #423: null/undefined guards | ✅ amenities a?.amenity?.label; profile.listings ?? []; photoUrl переменные |
| 3 | 401: apiClient + logout + redirect | ✅ setOn401 в AuthProvider, редирект на /auth/login |
| 4 | Обработка null API | ✅ data?.items \|\| [], if (!item) return; retry не на 401 |
| 5 | ErrorBoundary глобальный | ✅ ErrorBoundaryWrapper в layout |
| 6 | Suspense/loading скелеты | ✅ есть на главной, поиске, профиле, сообщениях |
| 7 | ReferenceError (CITIES) | ✅ импорт CITIES в HomePageV6 |
| 8 | Защита изображений | ✅ Gallery placeholder, ListingCard fallback, PLACEHOLDER_IMAGE константа |
| 9 | Dev-only логирование | ✅ console.error в apiFetch при NODE_ENV === development |

---

## Файлы

- `frontend/shared/api/client.ts` — 401, refresh, setOn401
- `frontend/domains/auth/AuthProvider.tsx` — setOn401(logout + redirect)
- `frontend/components/ui/ErrorBoundary.tsx` — глобальный ловец
- `frontend/app/ErrorBoundaryWrapper.tsx` — обёртка в layout
- `frontend/app/HomePageV6.tsx` — CITIES import, ключи listing.id
- `frontend/app/listings/[id]/ListingPage.tsx` — amenities key, optional chaining
- `frontend/components/listing/ListingCard.tsx` — fallback фото уже есть

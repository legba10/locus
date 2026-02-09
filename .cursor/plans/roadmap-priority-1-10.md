# Приоритетная дорожная карта LOCUS (1 → 10)

Источник: резюме проблем по скринам + полное ТЗ. Выполнять строго по порядку.

---

## 1) Админ / root-admin ✅ (частично)

- [x] ROOT_ADMIN_EMAIL в constants.ts
- [x] Миграция 008_root_admin_legba086.sql (Supabase)
- [x] ensureUserExists: appRole ADMIN для root
- [x] AdminGuard / SupabaseAuthGuard
- [x] POST /admin/set-role (только root)
- [x] Frontend: Dashboard (пользователи, объявления, модерация, выручка/GMV), таб Пользователи
- [x] Root не может быть понижен на UI (select disabled для legba086@mail.ru)

---

## 2) Модерация объявлений + workflow ✅

- [x] Статусы: draft | PENDING_REVIEW | published | rejected (Prisma)
- [x] При publish (host) → status PENDING_REVIEW; уведомление владельцу (LISTING_SUBMITTED) и админам (NEW_LISTING_PENDING)
- [x] GET /admin/moderation (alias к listings/pending), POST /admin/moderation/:id/approve, POST /admin/moderation/:id/reject
- [x] Frontend: таб Модерация — карточки с фото, описание, чеклист (фото/цена/удобства), кнопки Одобрить/Отклонить
- [x] Host (Мои объявления): баннер «На модерации» (ожидание до 24 ч), при reject — причина + кнопка «Исправить»

---

## 3) Listing page — верстка и API ✅ (частично)

- [x] API owner: name (не telegram_email), avatar, rating, listingsCount — исправлено: telegram_*@locus.app → «Гость»
- [x] ListingGallery: стрелки, свайп, миниатюры (уже сделано ранее)
- [x] ListingOwner: имя, «Профиль» → /user/[id]
- [x] Amenities: русские подписи (AMENITIES_MAP расширен, amenityLabel fallback)
- [x] Цена: frontend берёт basePrice из API (pricePerNight ?? basePrice), CTA formatPrice(price, 'night')
- [ ] Выравнивание карточек: padding 20px mobile, 32px desktop (проверить)
- [ ] ListingCtaSticky mobile: не перекрывать контент

---

## 4) Создание объявления — UX

- [ ] Drag-n-drop фото, прогресс, thumbnail grid
- [ ] Минимум полей, автосохранение draft
- [ ] Submit → status pending + moderation_task

---

## 5) Чат 1:1

- [x] Модель Conversation + Message, /messages, /chat/:id (есть)
- [ ] Модерация чатов (admin видит support), уведомления при новом сообщении

---

## 6) Уведомления

- [ ] Bell + GET/POST /api/notifications
- [ ] Web Push (VAPID), push_subscriptions
- [ ] Звук при уведомлении, admin broadcast

---

## 7) Платежи (тест)

- [ ] YooKassa/CloudPayments тест, env, webhook
- [ ] POST /api/bookings, POST /api/bookings/:id/pay, webhook → booking paid

---

## 8) Аутентификация

- [ ] Email OTP, Phone SMS OTP (SMS.ru/Twilio)
- [ ] Telegram login = merge с аккаунтом по email/phone

---

## 9) Admin metrics

- [x] Dashboard: GMV, доход, конверсия, юнит-экономика (реальные агрегаты)
- [ ] GET /admin/metrics (daily buckets)

---

## 10) QA / checklist

- [ ] Чек-лист по фичам перед релизом

---

## Сделано в этой сессии

- Владелец: в API вместо telegram_xxx@locus.app показывается «Гость» (listings.service getById).
- Root: в админке селект роли отключён для legba086@mail.ru (isRootUser, disabled + title).
- Удобства: расширен AMENITIES_MAP (wi_fi, washing_machine, conditioner, refrigerator, workspace, iron, hair_dryer и др.).
- Цена: priceValue = basePrice ?? pricePerNight на странице объявления; ListingCta — formatPrice(price, 'night').

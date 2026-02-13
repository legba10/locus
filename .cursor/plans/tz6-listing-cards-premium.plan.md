# ТЗ-6: Полная фиксация карточек объявлений (главная + список + mobile)

**Цель:** Карточки премиально выглядят, одинаково в light/dark, без багов цены, теней, отступов и mobile. Только исправление и унификация.

## Статус

| # | Пункт | Статус |
|---|--------|--------|
| 1 | Фон карточки light/dark, тени, overflow 20px | ✅ |
| 2 | Изображение 220/180px, overlay 0.45, hover zoom 1.04 | ✅ |
| 3 | Цена градиент #7c5cff–#a855f7, город/мета 14px rgba | ✅ |
| 4 | Лайк top 12px right 12px, blur, hover scale 1.1, active #ff4d6d | ✅ |
| 5 | Hover карточки -6px, тень, transition 0.25s | ✅ |
| 6 | Grid mobile 1 col gap 16px, skeleton shimmer 20px | ✅ |

## Изменённые файлы

- `frontend/styles/listing-card-tz6.css`:
  - Карточка: light rgba(255,255,255,0.8) border rgba(0,0,0,0.06) shadow 0 10px 30px; dark rgba(30,30,50,0.6) blur(14px) border rgba(255,255,255,0.06) shadow 0 20px 60px
  - Hover: translateY(-6px), shadow 0 30px 80px, image scale(1.04)
  - Изображение: height 180px mobile / 220px desktop, overlay gradient 0.45
  - Цена: 20px 700, gradient text 135deg #7c5cff #a855f7, fallback #7c5cff
  - Адрес/мета: 14px, rgba(0,0,0,0.6) / rgba(255,255,255,0.6)
  - Лайк: top/right 12px, 36×36, bg rgba(0,0,0,0.4) blur(10px), hover scale 1.1, is-saved #ff4d6d
  - Skeleton: border-radius 20px, photo 180/220px, shimmer animation
- `frontend/styles/globals.css`: .listing-grid на mobile явно grid-template-columns: 1fr, gap 16px

## Результат

- Цена фирменного градиента/цвета
- Карточки не выгорают в светлой теме (glass 0.8 + тень)
- Hover заметный (-6px + тень + zoom фото)
- Лайк не плавает (12px 12px), с blur
- Mobile: одна колонка, gap 16px, карточки одинаковые
- Skeleton: shimmer, radius 20px

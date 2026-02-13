# ТЗ-1: Восстановление логотипов, favicon и manifest-иконок

## Цель
Устранить 404 по логотипам и иконкам в header, PWA-manifest и во всех темах.

## Статус
- [x] 1. Public: строгая структура имён, недостающие файлы
- [x] 2. site.webmanifest исправлен, manifest.json убран/не используется
- [x] 3. layout.tsx: manifest + favicon ссылки
- [x] 4. Header: логотип только /logo-dark.svg (уже так)
- [x] 5. Очистка старых ссылок
- [ ] 6. Сборка и push

## Файлы
- `frontend/public/*` — ассеты
- `frontend/app/layout.tsx` — metadata, link manifest
- `frontend/components/layout/Header.tsx` — логотип

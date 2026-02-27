# TZ-71: Elevation System 2.0

## Уровни глубины (максимум 5)
| Уровень | Назначение        | Класс / токены |
|---------|-------------------|----------------|
| E0      | Базовый фон       | --bg-base-dark, --bg-base-light |
| E1      | Карточки          | .elevation-1, --shadow-e1, --shadow-e1-light |
| E2      | Стекло (nav, bar) | .elevation-2, --shadow-e2-outer/inset |
| E3      | Floating (FAB)    | .elevation-3, --shadow-e3 |
| E4      | Модалки           | .elevation-4, .modal-backdrop, --shadow-e4 |

## Z-Index (zindex.css)
- --z-base: 1, --z-card: 10, --z-glass: 20, --z-floating: 30, --z-e4: 40
- Overlay/modal по-прежнему --z-modal: 1000

## Сделано
- [x] elevation-system-tz71.css: E0–E4, тени, .modal-backdrop, .card:active scale(0.98)
- [x] Подключение в globals.css
- [x] bottom-nav использует --shadow-e2-*
- [x] card-tz47 использует --shadow-e1 / --shadow-e1-light, :active scale(0.98)
- [x] Убраны: glowPulse, hero purple shadow, home-hero radial, searchPulse
- [x] AI кнопка: нейтральная тень --shadow-e3

## Запрет
- Цветные glow, фиолетовые ореолы, radial-подсветки. Только физическая глубина.

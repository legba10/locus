# ТЗ: Финальное выравнивание блока фильтров + текста под переключателем

## Статус: выполнено

## Сделано

1. **Контейнер фильтров** — единый блок `.home-filter-block-tz-final`: max-width 920px, margin 0 auto, padding 24px, border-radius 18px, background surface/card. Mobile: padding 16px, margin 0 12px.
2. **Сетка** — `.home-filter-grid`: desktop 3 колонки (Город | Бюджет | Тип), gap 12px; mobile 1 колонка. Кнопка «Показать варианты» и «Фильтры» — grid-column 1 / -1, одна ширина.
3. **Кнопки** — «Показать варианты»: высота 52px, border-radius 14px, gradient, margin-top/bottom 8px. «Фильтры»: высота 48px, border-radius 12px, border, transparent.
4. **Переключатель режимов** — обёртка `.home-filter-mode-wrap`: max-width 520px, margin 20px auto 0, flex justify-content center.
5. **Подпись** — `.mode-switch__hint`: max-width 420px, margin 12px auto 0, text-align center, color secondary.
6. **Вертикальные отступы** — hero→filter 32px, filter→switcher 20px, подпись→список 32px.

## Файлы

- `frontend/app/HomePageV6.tsx` — разметка фильтра (grid, классы), обёртка переключателя, класс секции списка
- `frontend/styles/home-tz18.css` — стили контейнера, grid, кнопок, mode-wrap, списка
- `frontend/components/home/ModeSwitchBlock.tsx` — max-width 520px у segment-wrap, подпись без дублирования стилей

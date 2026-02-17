# ТЗ: Переключатель режимов + меню аватара (критические баги)

## Статус: в работе

## Часть 1 — Переключатель «Ручной / AI-подбор»

- [x] Дефолт режима: `aiMode: false` в `filterTypes.ts`
- [x] Компонент `ModeSwitchBlock`: один контейнер, кнопки Ручной / AI-подбор
- [x] Логика: клик «Ручной» → mode manual, клик «AI-подбор» → mode ai; активная подсвечена градиентом
- [x] Подпись синхронизирована: manual / ai тексты по ТЗ
- [x] CSS: контейнер 14px radius, var(--surface), padding 4px; mobile без gap

## Часть 2 — Меню аватара и шапка

- [x] Уведомления в шапке для mobile: колокольчик показывается при `authed` на всех брейкпоинтах
- [x] Удалены из меню аватара: Сообщения, Избранное
- [x] Настройки и «Разместить объявление» в меню видны на всех экранах

## Файлы

- `frontend/core/filters/filterTypes.ts` — default aiMode false
- `frontend/components/home/ModeSwitchBlock.tsx` — переписан
- `frontend/styles/home-tz18.css` — стили mode-switch
- `frontend/components/layout/Header.tsx` — уведомления mobile, пункты меню

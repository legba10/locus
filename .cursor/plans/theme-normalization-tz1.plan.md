# План: ТЗ №1 — Нормализация темы (light/dark), устранение засветов

## Выполнено

### 1. Theme (theme.css + tokens.css)
- Dark: --text-primary: #e6eaf2 (не #ffffff), --bg-main: #070b17, --bg-card: #0f1629, --bg-input: #0c1324, --text-secondary: #9aa3b2, --text-muted: #6b7280.
- Добавлена переменная --text-on-accent для кнопок (light: #fff, dark: #e6eaf2).
- Footer: переход на var(--bg-secondary), var(--border-main), в dark — var(--bg-main).

### 2. Глобально (globals.css)
- body уже использует var(--bg-main), var(--text-primary).
- В dark переопределены .text-gray-* → var(--text-secondary).

### 3. Переключатель темы
- ThemeProvider выставляет data-theme на documentElement; layout выполняет init-скрипт.

### 4. Страницы входа/регистрации
- Login: фон var(--bg-main), карточка var(--bg-card), заголовки var(--text-primary), подтекст var(--text-secondary), инпуты var(--bg-input), border var(--border-main), кнопки var(--accent) + var(--text-on-accent).
- Register: те же замены по всей форме и шагам (форма, AI-параметры, подтверждение).

### 5. AI (AIWizardModal, AiSearchWizard)
- Модалка: overlay var(--overlay-bg), кнопка var(--text-on-accent).
- AiSearchWizard: контейнер и все поля на переменных темы.

### 6. HomePageV6
- Кнопки: text-white → text-[var(--text-on-accent)], overlay bg-black/40 → var(--overlay-bg).

### 7. Кабинет (OwnerDashboardV7 + profile)
- OwnerDashboardV7: фон var(--bg-main), сайдбар var(--bg-card), навигация var(--accent)/var(--text-on-accent), все вкладки (Мои объявления, Бронирования, Сообщения, Аналитика, Профиль) — карточки var(--bg-card), текст var(--text-primary/secondary), кнопки var(--accent).
- profile/page.tsx: карточка, тост, кнопка «Сохранить», скелетоны на переменных.

### 8. Бронирования
- app/bookings/page.tsx: фон var(--bg-main), заголовок и карточка на переменных.

### 9. Добавление объявления (ListingWizard)
- Заголовки, подзаголовки, лейблы, инпуты, карточки, кнопки «Далее»/«Назад», прогресс, шаг 0 (Старт), превью — переведены на var(--text-primary), var(--text-secondary), var(--bg-card), var(--bg-input), var(--border-main), var(--accent), var(--text-on-accent). Оставлены: overlay на фото (bg-black/55 text-white) и акцентные состояния violet для drag — по ТЗ не обязательно менять overlay.

## Рекомендуется проверить вручную
- Переключить тему 10 раз: без мигания, текст читаем.
- iPhone: login, register, ai params, cabinet, add listing, bookings, menu.

## Критерий готовности
Переключение темы 10 раз: без мигания, текст читаем, нет серых/белых конфликтов.

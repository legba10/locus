/**
 * UI feature flags. Toggle without touching auth/backend.
 */
export const ENABLE_LOGIN_ROBOT = true;

/** ТЗ 1: новый UI карточки и страницы объявления (информативные блоки, мини-галерея, быстрые действия, AI-блок). */
export const useNewListingUI = true;

/** ТЗ 2: кабинет владельца v2 — главная, 5 зон, один «Разместить», SidebarV2, карточки объявлений. */
export const useCabinetV2 = true;

/** ТЗ 3: профиль и настройки v2 — 6 вкладок, тема только в Настройках. */
export const useProfileV2 = true;

/** ТЗ 4: создание объявления v2 — 8 шагов (тип, адрес, фото, параметры, описание, цена, проверка, публикация). */
export const useCreateListingV2 = true;

/** ТЗ 7: карточки объявлений — информативная карточка уровня Cian/Airbnb (фото 220/200, оверлеи, блок доверия, hover). */
export const useListingCardTZ7 = true;

/** ТЗ 8: страница объявления — галерея 420px, основной блок, бронирование справа, AI, описание, удобства, хозяин, район, похожие. */
export const useListingPageTZ8 = true;

/** ТЗ-13: next-gen карточки объявлений — AI-метрики, бейджи, локация, кнопки [♡] [Посмотреть], сетка 3 колонки gap 24px. */
export const useListingCardTZ13 = true;

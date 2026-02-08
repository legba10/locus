'use client'

import { ListingPageV2 } from './ListingPageV2'

interface ListingPageLightProps {
  id: string
}

/**
 * ListingPageLight — Детальная страница объявления (v2)
 *
 * Структура: Галерея → Основная информация → Цена+CTA → Владелец → Удобства → Описание → Карта → Бронирование → Отзывы.
 * Mobile: sticky bottom bar. Отзывы — пошаговые метрики.
 */
export function ListingPageLight({ id }: ListingPageLightProps) {
  return <ListingPageV2 id={id} />
}

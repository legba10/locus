'use client'

import { ListingPageV3 } from './ListingPageV3'

interface ListingPageLightProps {
  id: string
}

/**
 * ListingPageLight — Детальная страница объявления (ТЗ-6)
 *
 * Единый ListingLayout: Галерея → Основной блок → StickyActions → Владелец → Метрики AI → Удобства → Описание → Отзывы → Похожие.
 */
export function ListingPageLight({ id }: ListingPageLightProps) {
  return <ListingPageV3 id={id} />
}

'use client'

import { ListingPageV7 } from './ListingPageV7'

interface ListingPageLightProps {
  id: string
}

/**
 * ListingPageLight — Детальная страница объявления
 * 
 * Использует расширенную версию ListingPageV7 с 9 блоками:
 * 1. Галерея (без текстов на фото, только badges)
 * 2. Основная информация
 * 3. CTA-блок (справа)
 * 4. AI-анализ (отдельный блок)
 * 5. Описание жилья
 * 6. Удобства
 * 7. Карта
 * 8. Отзывы
 * 9. Похожие предложения
 */
export function ListingPageLight({ id }: ListingPageLightProps) {
  return <ListingPageV7 id={id} />
}

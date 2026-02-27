'use client'

import type { ListingItem } from './listing.types'
import styles from './listing.module.css'

interface ListingHeaderProps {
  listing: ListingItem
}

export default function ListingHeader({ listing }: ListingHeaderProps) {
  const price =
    listing.pricePerNight > 0
      ? `${listing.pricePerNight.toLocaleString('ru-RU')} ₽`
      : 'Цена по запросу'

  return (
    <div className={styles.headerBlock}>
      <h1>{listing.title || 'Без названия'}</h1>
      <div className={styles.price}>{price}</div>
    </div>
  )
}

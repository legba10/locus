'use client'

import type { ListingItem } from './listing.types'
import styles from './listing.module.css'

interface ListingDetailsProps {
  listing: ListingItem
}

export default function ListingDetails({ listing }: ListingDetailsProps) {
  const guests = (listing as any).capacityGuests ?? (listing as any).maxGuests ?? 2
  const rooms = listing.bedrooms ?? 1

  return (
    <div className={styles.detailsGrid}>
      <div className={`${styles.card} ${styles.detailItem}`}>
        <div className={styles.value}>{rooms}</div>
        <div className={styles.label}>комнат</div>
      </div>
      <div className={`${styles.card} ${styles.detailItem}`}>
        <div className={styles.value}>{guests}</div>
        <div className={styles.label}>гостей</div>
      </div>
      <div className={`${styles.card} ${styles.detailItem}`}>
        <div className={styles.value}>{listing.area ?? '—'}</div>
        <div className={styles.label}>м²</div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import type { ListingItem } from './listing.types'
import styles from './listing.module.css'

interface ListingOwnerPanelProps {
  listing: ListingItem
}

export default function ListingOwnerPanel({ listing }: ListingOwnerPanelProps) {
  return (
    <div className={styles.ownerPanel}>
      <Link href={`/listing/edit/${listing.id}`} className={styles.primary}>
        Редактировать
      </Link>
      <Link href="/profile/promo">Продвижение</Link>
      <Link href="/profile/analytics">Статистика</Link>
      <Link href="/profile/calendar">Календарь</Link>
    </div>
  )
}

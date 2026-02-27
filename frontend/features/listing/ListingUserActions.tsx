'use client'

import styles from './listing.module.css'

interface ListingUserActionsProps {
  onWrite: () => void
  onBook: () => void
}

export default function ListingUserActions({ onWrite, onBook }: ListingUserActionsProps) {
  return (
    <div className={styles.actionBar}>
      <button type="button" className={styles.secondary} onClick={onWrite}>
        Написать
      </button>
      <button type="button" className={styles.primary} onClick={onBook}>
        Забронировать
      </button>
    </div>
  )
}

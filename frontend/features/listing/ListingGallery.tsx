'use client'

import type { ListingItem } from './listing.types'
import styles from './listing.module.css'

interface ListingGalleryProps {
  listing: ListingItem
}

export default function ListingGallery({ listing }: ListingGalleryProps) {
  const images = listing.photos
  const mainUrl = images[0]?.url

  if (!mainUrl) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImagePlaceholder}>Нет фото</div>
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      <img src={mainUrl} alt={listing.title} className={styles.mainImage} />
    </div>
  )
}

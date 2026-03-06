'use client'

/** TZ-2: вывод объявлений по фильтрам */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { searchListings } from './search.api'
import type { SearchFilters } from './FiltersState'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import styles from './search.module.css'

interface ListingsResultProps {
  filters: SearchFilters
}

export default function ListingsResult({ filters }: ListingsResultProps) {
  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await searchListings(filters)
        if (!cancelled) {
          setListings(data.items ?? [])
          setTotal(data.total ?? 0)
        }
      } catch (e) {
        if (!cancelled) {
          setError(String(e))
          setListings([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filters])

  if (loading) {
    return (
      <div className={styles.resultsArea}>
        <div className={styles.resultsCount}>Загрузка...</div>
        <div className={styles.resultsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>Ошибка загрузки</p>
        <p className={styles.emptyStateSubtitle}>{error}</p>
        <button
          type="button"
          className={styles.emptyStateBtn}
          onClick={() => window.location.reload()}
        >
          Повторить
        </button>
      </div>
    )
  }

  if (!listings.length) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>Ничего не найдено</p>
        <p className={styles.emptyStateSubtitle}>Измените запрос или фильтры</p>
      </div>
    )
  }

  return (
    <div className={styles.resultsArea}>
      <div className={styles.resultsCount}>
        Найдено: <strong>{total}</strong>
      </div>
      <div className={styles.resultsGrid}>
        {listings.map((l) => (
          <Link key={l.id} href={`/listing/${l.id}`}>
            <ListingCard
              id={l.id}
              photo={l.photos?.[0]?.url ?? l.images?.[0]?.url}
              title={l.title ?? ''}
              price={l.basePrice ?? l.pricePerNight ?? 0}
              city={l.city ?? ''}
              district={l.district}
              rooms={l.bedrooms}
              area={l.area}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

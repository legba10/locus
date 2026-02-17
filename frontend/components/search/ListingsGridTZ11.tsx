'use client'

import { ListingCard, ListingCardSkeleton } from '@/components/listing/ListingCard'
import { cn } from '@/shared/utils/cn'

/** Минимальный тип объявления для карточки ТЗ-9 (id, title, price, city, district, rooms, photos, ...) */
export interface ListingItemTZ11 {
  id: string
  title: string
  price: number
  city: string
  district?: string | null
  rooms?: number | null
  area?: number | null
  floor?: number | null
  totalFloors?: number | null
  photos?: Array<{ url: string }>
  photo?: string | null
  /** Для сортировки «сначала новые» */
  createdAt?: string
  /** Для фильтра тип жилья */
  propertyType?: string
}

export interface ListingsGridTZ11Props {
  items: ListingItemTZ11[]
  isLoading?: boolean
  /** ТЗ-12: пустое состояние — кнопка действия (например «Сбросить фильтры») */
  onEmptyAction?: () => void
  emptyActionLabel?: string
  className?: string
}

/**
 * ТЗ №11: сетка карточек объявлений (карточка из ТЗ-9).
 * Пустое состояние: «Ничего не найдено».
 */
export function ListingsGridTZ11({
  items,
  isLoading,
  onEmptyAction,
  emptyActionLabel = 'Сбросить фильтры',
  className,
}: ListingsGridTZ11Props) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-8 text-center',
          className
        )}
      >
        <div
          className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[32px] mx-auto mb-4"
          aria-hidden
        >
          🔍
        </div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)]">Ничего не найдено</p>
        <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
          Попробуйте изменить параметры поиска или фильтры
        </p>
        {onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-6 btn btn--primary btn--md"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item) => (
        <ListingCard
          key={item.id}
          id={item.id}
          title={item.title}
          price={item.price}
          city={item.city}
          district={item.district ?? null}
          rooms={item.rooms ?? undefined}
          area={item.area ?? undefined}
          floor={item.floor ?? undefined}
          totalFloors={item.totalFloors ?? undefined}
          photo={item.photo ?? null}
          photos={item.photos ?? undefined}
        />
      ))}
    </div>
  )
}

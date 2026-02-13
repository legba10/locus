'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

const SWIPE_THRESHOLD = 50

export interface GalleryProps {
  photos: Array<{ url: string; alt?: string }>
  title: string
  onOpenFullscreen?: () => void
  /** Кнопка «назад» — overlay слева */
  showBack?: boolean
  /** Иконка ❤️ справа (в избранном или нет) */
  isFavorite?: boolean
  onFavoriteClick?: () => void
}

export function Gallery({
  photos,
  title,
  onOpenFullscreen,
  showBack = true,
  isFavorite = false,
  onFavoriteClick,
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const hasPhotos = photos?.length > 0
  const count = photos?.length ?? 0
  const cover = photos?.[activeIndex]?.url ?? photos?.[0]?.url

  const goPrev = useCallback(() => {
    if (count <= 1) return
    setActiveIndex((i) => (i - 1 + count) % count)
  }, [count])
  const goNext = useCallback(() => {
    if (count <= 1) return
    setActiveIndex((i) => (i + 1) % count)
  }, [count])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart == null) return
      const dx = touchStart - e.changedTouches[0].clientX
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) goNext()
        else goPrev()
      }
      setTouchStart(null)
    },
    [touchStart, goPrev, goNext]
  )

  return (
    <div className="listing-gallery-tz7 max-w-[1200px] mx-auto">
      <div className="relative w-full overflow-hidden bg-[var(--bg-card)] rounded-[20px]">
        {/* TZ-5: aspect 16/9 — фото не вытянуты на desktop */}
        <div
          className="listing-gallery-tz7__main relative w-full aspect-[16/9] select-none rounded-t-[20px] overflow-hidden bg-[var(--bg-card)]"
          onClick={onOpenFullscreen}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role={hasPhotos ? 'button' : undefined}
        >
          {hasPhotos && cover ? (
            <>
              <Image
                src={cover}
                alt={photos[activeIndex]?.alt ?? title}
                fill
                className="object-cover touch-none"
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? 'eager' : 'lazy'}
                unoptimized={cover.startsWith('http')}
                sizes="(max-width: 768px) 100vw, 1100px"
                draggable={false}
              />
              {showBack && (
                <Link
                  href="/listings"
                  className="absolute left-3 top-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
                  aria-label="Назад"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}
              {onFavoriteClick && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onFavoriteClick() }}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
                  aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                >
                  <svg className={cn('w-5 h-5', isFavorite && 'fill-red-400 text-red-400')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goPrev() }}
                    className="listing-gallery-tz7__arrow absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center transition-opacity hidden md:flex opacity-60 hover:opacity-100"
                    aria-label="Предыдущее"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goNext() }}
                    className="listing-gallery-tz7__arrow absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center transition-opacity hidden md:flex opacity-60 hover:opacity-100"
                    aria-label="Следующее"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
              {count > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[12px] font-medium tabular-nums">
                  {activeIndex + 1}/{count}
                </div>
              )}
            </>
          ) : (
            <div className="listing-gallery-tz7__skeleton w-full aspect-[16/9] flex items-center justify-center rounded-t-[20px] bg-[var(--bg-secondary)]" />
          )}
        </div>

        {/* TZ-5: миниатюры + scroll snap на мобиле */}
        {hasPhotos && count > 1 && (
          <div className="flex gap-2 p-3 border-t border-[var(--border)] overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-thin snap-x snap-mandatory">
            {photos.slice(0, 8).map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                className={cn(
                  'relative flex-shrink-0 w-[60px] h-[60px] rounded-[10px] overflow-hidden border-2 transition-colors snap-start',
                  activeIndex === i ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : 'border-transparent hover:border-[var(--border)]'
                )}
              >
                <Image src={p.url} alt={p.alt ?? `${title} ${i + 1}`} fill className="object-cover" sizes="60px" loading="lazy" unoptimized={p.url.startsWith('http')} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

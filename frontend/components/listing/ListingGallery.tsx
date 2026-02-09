'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'

export interface ListingGalleryProps {
  photos: Array<{ url: string; alt?: string }>
  title: string
  verified?: boolean
  onOpenFullscreen?: () => void
}

const SWIPE_THRESHOLD = 50

export function ListingGallery({ photos, title, verified, onOpenFullscreen }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [hoverThumbIndex, setHoverThumbIndex] = useState<number | null>(null)
  const hasPhotos = photos?.length > 0
  const count = photos?.length ?? 0
  const cover = photos?.[activeIndex]?.url || photos?.[0]?.url
  const previewUrl = hoverThumbIndex != null && photos?.[hoverThumbIndex] ? photos[hoverThumbIndex].url : null

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (count <= 1) return
      setActiveIndex((i) => (i - 1 + count) % count)
    },
    [count]
  )
  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (count <= 1) return
      setActiveIndex((i) => (i + 1) % count)
    },
    [count]
  )

  useEffect(() => {
    if (!hasPhotos || count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasPhotos, count, goPrev, goNext])

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
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100'
      )}
    >
      <div
        className="relative w-full h-[42vh] sm:h-[45vh] min-h-[240px] bg-gray-100 select-none"
        onClick={onOpenFullscreen}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role={hasPhotos ? 'button' : undefined}
      >
        {hasPhotos && cover ? (
          <>
            <Image
              src={previewUrl || cover}
              alt={photos[hoverThumbIndex ?? activeIndex]?.alt ?? title}
              fill
              className={cn(
                'object-cover touch-none transition-opacity duration-200',
                previewUrl ? 'opacity-100' : 'opacity-100'
              )}
              priority
              unoptimized={(previewUrl || cover).startsWith('http')}
              sizes="(max-width: 1024px) 100vw, 66vw"
              draggable={false}
            />
            {verified && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white text-[12px] font-semibold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Проверено
                </span>
              </div>
            )}

            {/* Arrows — на мобильном меньше, на десктопе крупнее */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition-colors"
                  aria-label="Предыдущее фото"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition-colors"
                  aria-label="Следующее фото"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Dots indicator */}
            {count > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIndex(i)
                    }}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      activeIndex === i ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
                    )}
                    aria-label={`Фото ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-400">
            Фото пока не добавлены
          </div>
        )}
      </div>

      {/* Thumbnails — desktop with hover preview (main image switches to hovered thumb on hover) */}
      {hasPhotos && count > 1 && (
        <div
          className="hidden sm:flex gap-2 p-3 overflow-x-auto border-t border-gray-100"
          onMouseLeave={() => setHoverThumbIndex(null)}
        >
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex(i)
                setHoverThumbIndex(null)
              }}
              onMouseEnter={() => setHoverThumbIndex(i)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                activeIndex === i ? 'border-violet-500' : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={p.url}
                alt={p.alt ?? `${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={p.url.startsWith('http')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

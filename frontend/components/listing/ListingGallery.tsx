'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

export interface ListingGalleryProps {
  photos: Array<{ url: string; alt?: string }>
  title: string
  verified?: boolean
  onOpenFullscreen?: () => void
}

export function ListingGallery({ photos, title, verified, onOpenFullscreen }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasPhotos = photos?.length > 0
  const cover = photos?.[activeIndex]?.url || photos?.[0]?.url

  return (
    <div
      className={cn(
        'bg-white rounded-[18px] overflow-hidden',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80'
      )}
    >
      <div
        className="relative w-full h-[42vh] sm:h-[45vh] min-h-[240px] bg-gray-100"
        onClick={onOpenFullscreen}
        role={hasPhotos ? 'button' : undefined}
      >
        {hasPhotos && cover ? (
          <>
            <Image
              src={cover}
              alt={photos[activeIndex]?.alt ?? title}
              fill
              className="object-cover"
              priority
              unoptimized={cover.startsWith('http')}
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            {verified && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white text-[12px] font-semibold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Проверено
                </span>
              </div>
            )}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      activeIndex === i ? 'bg-white' : 'bg-white/50'
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
    </div>
  )
}

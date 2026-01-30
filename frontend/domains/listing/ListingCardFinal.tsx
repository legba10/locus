'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LocusDecisionBadge } from '@/shared/ui/locus/LocusDecisionBlock'
import { cn } from '@/shared/utils/cn'

interface ListingCardFinalProps {
  id: string
  title: string
  price: number
  image?: string
  city: string
  
  // LOCUS AI (упрощённый)
  locusScore?: number
  locusVerdict?: string // "Подходит", "Хороший вариант"
  locusTip?: string // 1 строка
  
  // Опционально
  isFavorite?: boolean
  onFavorite?: (id: string) => void
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ListingCard v4 — финальная карточка LOCUS
 * 
 * Правило:
 * - AI блок не больше 2 строк
 * - крупный шрифт
 * - минимум цветов
 * 
 * Элементы:
 * 1. photo
 * 2. price
 * 3. locusScore + locusVerdict
 * 4. locusTip
 * 5. кнопка действия
 */
export function ListingCardFinal({
  id,
  title,
  price,
  image,
  city,
  locusScore,
  locusVerdict,
  locusTip,
  isFavorite = false,
  onFavorite,
  className,
}: ListingCardFinalProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [imgError, setImgError] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setFavorite(!favorite)
    onFavorite?.(id)
  }

  return (
    <article className={cn(
      'rounded-xl border border-gray-200 bg-white overflow-hidden',
      'transition hover:shadow-md',
      className
    )}>
      {/* 1. Фото */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
        {image && !imgError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🏠
          </div>
        )}

        {/* Избранное */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-2 right-2 rounded-full p-1.5 transition',
            favorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
          )}
        >
          <svg className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Контент */}
      <div className="p-3">
        {/* 2. Цена */}
        <div className="mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(price)} ₽</span>
          <span className="text-gray-500"> / ночь</span>
        </div>

        {/* 3. LOCUS оценка + вердикт */}
        {locusScore !== undefined && locusVerdict && (
          <div className="mb-2">
            <LocusDecisionBadge score={locusScore} verdict={locusVerdict} />
          </div>
        )}

        {/* 4. Совет LOCUS (1 строка) */}
        {locusTip && (
          <p className="text-sm text-gray-600 truncate mb-2">{locusTip}</p>
        )}

        {/* Город */}
        <p className="text-xs text-gray-400 mb-3">{city}</p>

        {/* 5. Кнопка действия */}
        <Link
          href={`/listings/${id}`}
          className="block w-full text-center rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Подробнее
        </Link>
      </div>
    </article>
  )
}

/**
 * ListingCardFinalSkeleton
 */
export function ListingCardFinalSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded mt-3" />
      </div>
    </div>
  )
}

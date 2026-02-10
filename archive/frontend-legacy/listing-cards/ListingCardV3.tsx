'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LocusScoreBadge } from '@/shared/ui/locus/LocusScoreBadge'
import { LocusPriceMini } from '@/shared/ui/locus/LocusPriceBlock'
import { cn } from '@/shared/utils/cn'

interface ListingCardV3Props {
  id: string
  title: string
  city: string
  price: number
  photo?: string
  
  // AI Insight
  score?: number
  verdict?: string
  priceDiff?: number
  pricePosition?: 'below_market' | 'market' | 'above_market'
  demand?: 'low' | 'medium' | 'high'
  shortSummary?: string
  
  // Дополнительно
  rooms?: number
  beds?: number
  bathrooms?: number
  rating?: number
  reviewCount?: number
  
  // Интерактивность
  isFavorite?: boolean
  onFavorite?: (id: string, isFavorite: boolean) => void
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

function DemandDots({ level }: { level: string }) {
  const dots = level === 'high' ? 3 : level === 'medium' ? 2 : 1
  const color = level === 'high' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
  
  return (
    <div className="flex gap-0.5 items-center" title={`Спрос: ${level === 'high' ? 'высокий' : level === 'medium' ? 'средний' : 'низкий'}`}>
      {[1, 2, 3].map((d) => (
        <div key={d} className={cn('w-1 h-1 rounded-full', d <= dots ? color : 'bg-gray-200')} />
      ))}
    </div>
  )
}

/**
 * ListingCard v3 — карточка объявления с AI-анализом
 * 
 * Обязательные элементы:
 * - фото
 * - цена
 * - город  
 * - LocusScoreBadge
 * - короткий вывод
 * - кнопка «Подробнее»
 */
export function ListingCardV3({
  id,
  title,
  city,
  price,
  photo,
  score,
  verdict,
  priceDiff,
  pricePosition,
  demand,
  shortSummary,
  rooms,
  beds,
  bathrooms,
  rating,
  reviewCount,
  isFavorite = false,
  onFavorite,
  className,
}: ListingCardV3Props) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [imageError, setImageError] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = !favorite
    setFavorite(newState)
    onFavorite?.(id, newState)
  }

  return (
    <article className={cn(
      'group rounded-2xl border border-gray-200 bg-white overflow-hidden',
      'transition-all duration-200 hover:shadow-lg hover:border-gray-300',
      className
    )}>
      {/* Фото */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
        {photo && !imageError ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            🏠
          </div>
        )}

        {/* Оценка LOCUS */}
        {score != null && score > 0 && (
          <div className="absolute top-3 left-3">
            <LocusScoreBadge score={score} size="sm" showLabel={false} />
          </div>
        )}

        {/* Избранное */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-3 right-3 rounded-full p-2 transition',
            favorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'
          )}
          aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <svg className="h-5 w-5" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Цена относительно рынка */}
        {pricePosition && pricePosition !== 'market' && (
          <div className="absolute bottom-3 left-3">
            <LocusPriceMini position={pricePosition} priceDiff={priceDiff} />
          </div>
        )}
      </Link>

      {/* Контент */}
      <div className="p-4">
        {/* Заголовок */}
        <Link href={`/listings/${id}`}>
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
            {title}
          </h3>
        </Link>

        {/* Город */}
        <p className="text-sm text-gray-500 mt-0.5">{city}</p>

        {/* Вердикт AI */}
        {verdict && (
          <div className="mt-2">
            <span className={cn(
              'text-sm',
              score && score >= 80 ? 'text-emerald-600' :
              score && score >= 60 ? 'text-blue-600' :
              'text-gray-600'
            )}>
              {score && score >= 80 ? '✓ ' : score && score >= 60 ? '• ' : '○ '}
              {verdict}
            </span>
          </div>
        )}

        {/* Короткий вывод */}
        {shortSummary && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{shortSummary}</p>
        )}

        {/* Характеристики */}
        {(rooms || beds || bathrooms) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            {rooms && <span>{rooms} комн.</span>}
            {beds && <span>{beds} кров.</span>}
            {bathrooms && <span>{bathrooms} ванн.</span>}
          </div>
        )}

        {/* Цена и спрос */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(price)}</span>
            <span className="text-sm text-gray-500">/ночь</span>
          </div>
          {demand && <DemandDots level={demand} />}
        </div>

        {/* Рейтинг и кнопка */}
        <div className="mt-3 flex items-center justify-between">
          {rating != null ? (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="text-amber-500">⭐</span>
              <span>{rating.toFixed(1)}</span>
              {reviewCount != null && <span className="text-gray-400">({reviewCount})</span>}
            </div>
          ) : (
            <div />
          )}
          <Link
            href={`/listings/${id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            Подробнее →
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * ListingCardV3Skeleton — скелетон загрузки
 */
export function ListingCardV3Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse', className)}>
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

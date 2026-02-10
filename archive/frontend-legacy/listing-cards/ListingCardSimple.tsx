'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { LocusInsight } from '@/shared/types/insight'
import { getInsightColor, formatPriceDiff } from '@/shared/types/insight'
import { cn } from '@/shared/utils/cn'

interface ListingCardSimpleProps {
  id: string
  title: string
  city: string
  price: number
  photo?: string
  insight?: LocusInsight
  isFavorite?: boolean
  onFavorite?: (id: string, isFavorite: boolean) => void
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ListingCardSimple — упрощённая карточка объявления
 * 
 * Элементы:
 * - фото
 * - цена
 * - оценка LOCUS
 * - 1 строка анализа
 * - кнопка действия
 */
export function ListingCardSimple({
  id,
  title,
  city,
  price,
  photo,
  insight,
  isFavorite = false,
  onFavorite,
  className,
}: ListingCardSimpleProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [imgError, setImgError] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorite(!favorite)
    onFavorite?.(id, !favorite)
  }

  const color = insight ? getInsightColor(insight.label) : null

  return (
    <article className={cn(
      'rounded-xl border border-gray-200 bg-white overflow-hidden',
      'transition hover:shadow-md hover:border-gray-300',
      className
    )}>
      {/* Фото */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
        {photo && !imgError ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={photo.startsWith('http')}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🏠
          </div>
        )}

        {/* Оценка */}
        {insight && (
          <div className={cn(
            'absolute top-3 left-3 px-2 py-1 rounded-lg text-sm font-medium',
            color?.bg, color?.text
          )}>
            {insight.score}
          </div>
        )}

        {/* Избранное */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-3 right-3 rounded-full p-1.5 transition',
            favorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
          )}
        >
          <svg className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Контент */}
      <div className="p-3">
        {/* Цена */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-lg font-bold text-gray-900">{formatPrice(price)} ₽</span>
          <span className="text-sm text-gray-500">/ ночь</span>
        </div>

        {/* Оценка и label */}
        {insight && (
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-sm font-medium',
              insight.label === 'Отличный' ? 'text-emerald-600' :
              insight.label === 'Хороший' ? 'text-blue-600' :
              insight.label === 'Средний' ? 'text-amber-600' : 'text-gray-500'
            )}>
              {insight.label} вариант
            </span>
          </div>
        )}

        {/* 1 строка анализа */}
        {insight && (
          <p className="text-sm text-gray-600 truncate">
            {formatPriceDiff(insight.priceDiffPercent)}
          </p>
        )}

        {/* Город */}
        <p className="text-xs text-gray-400 mt-1">{city}</p>

        {/* Кнопка */}
        <Link
          href={`/listings/${id}`}
          className="mt-3 block w-full text-center rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
        >
          Подробнее
        </Link>
      </div>
    </article>
  )
}

/**
 * ListingCardSimpleSkeleton
 */
export function ListingCardSimpleSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded mt-3" />
      </div>
    </div>
  )
}

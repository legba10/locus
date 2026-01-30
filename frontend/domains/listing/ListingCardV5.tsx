'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Card, ScoreBadge, DemandTag, Button } from '@/ui-system'
import { cn } from '@/shared/utils/cn'

interface ListingCardV5Props {
  id: string
  
  // Основное
  photo?: string
  price: number
  city: string
  district?: string
  
  // AI Decision
  score?: number
  verdict?: string // "Отличный вариант", "Хороший вариант", "Сомнительно"
  explanation?: string // "Цена ниже рынка на 12%"
  demandLevel?: 'low' | 'medium' | 'high'
  
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ListingCardV5 — Product Version
 * 
 * Структура карточки:
 * 
 * [Фото]
 * 
 * Цена крупно
 * Оценка + вердикт (badge)
 * Короткий вывод AI (1 строка)
 * Индикатор спроса
 * Город / район
 * 
 * [Кнопка] Подробнее
 * 
 * ❗ Карточка = решение, а не описание.
 */
export function ListingCardV5({
  id,
  photo,
  price,
  city,
  district,
  score,
  verdict,
  explanation,
  demandLevel,
  className,
}: ListingCardV5Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <Card variant="bordered" padding="none" hoverable className={cn('overflow-hidden', className)}>
      {/* ФОТО */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
        {photo && !imgError ? (
          <Image
            src={photo}
            alt="Фото жилья"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            🏠
          </div>
        )}
      </Link>

      <div className="p-3">
        {/* ЦЕНА КРУПНО */}
        <div className="mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(price)} ₽</span>
          <span className="text-gray-500"> / мес</span>
        </div>

        {/* ОЦЕНКА + ВЕРДИКТ */}
        {score !== undefined && verdict && (
          <div className="flex items-center gap-2 mb-2">
            <ScoreBadge score={score} size="md" />
            <span className={cn(
              'font-medium',
              score >= 80 ? 'text-emerald-600' : 
              score >= 60 ? 'text-blue-600' : 
              score >= 40 ? 'text-amber-600' : 'text-gray-500'
            )}>
              {verdict}
            </span>
          </div>
        )}

        {/* КОРОТКИЙ ВЫВОД AI (1 строка) */}
        {explanation && (
          <p className="text-sm text-gray-600 truncate mb-2">{explanation}</p>
        )}

        {/* ИНДИКАТОР СПРОСА */}
        {demandLevel && (
          <div className="mb-2">
            <DemandTag level={demandLevel} />
          </div>
        )}

        {/* ГОРОД / РАЙОН */}
        <p className="text-xs text-gray-400 mb-3">
          {city}
          {district && ` · ${district}`}
        </p>

        {/* КНОПКА */}
        <Link href={`/listings/${id}`}>
          <Button variant="primary" fullWidth>
            Подробнее
          </Button>
        </Link>
      </div>
    </Card>
  )
}

/**
 * ListingCardV5Skeleton
 */
export function ListingCardV5Skeleton() {
  return (
    <Card variant="bordered" padding="none" className="overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded mt-2" />
      </div>
    </Card>
  )
}

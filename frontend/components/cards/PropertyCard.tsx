'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

export type PropertyCardProps = {
  id: string
  title?: string
  pricePerNight: number
  city?: string
  photoUrl?: string
  viewsCount?: number
  matchPercent?: number
  params?: string
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ТЗ-3: Единая карточка жилья.
 * Структура: Фото → Цена → Город → Параметры → AI-оценка → Кнопки.
 * Стиль: var(--bg-card), radius 20px, padding 16px, тень.
 */
export function PropertyCard({
  id,
  title,
  pricePerNight,
  city,
  photoUrl,
  viewsCount,
  matchPercent,
  params,
  className,
}: PropertyCardProps) {
  const router = useRouter()

  return (
    <article
      className={cn(
        'property-card rounded-[var(--radius-card)] overflow-hidden',
        'bg-[var(--bg-card)] p-[var(--space-card-inner)]',
        'shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[var(--border)]',
        'transition hover:shadow-[var(--shadow-card)]',
        className
      )}
    >
      {/* 1. Фото — ТЗ-3 п.5 */}
      <Link
        href={`/listings/${id}`}
        className="block relative rounded-[16px] overflow-hidden bg-[var(--bg-secondary)]"
        style={{ height: 180 }}
        aria-label={title || 'Открыть объявление'}
      >
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={title || 'Жильё'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={photoUrl.startsWith('http')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[12px]">
            Нет фото
          </div>
        )}
        {/* AI бейдж — ТЗ-3 п.5 */}
        {matchPercent != null && (
          <span
            className="absolute top-[10px] left-[10px] px-2 py-1 rounded-[12px] text-[12px] font-semibold"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
              color: 'var(--text-primary)',
            }}
          >
            AI {matchPercent}%
          </span>
        )}
        {/* Просмотры — ТЗ-3 п.5 */}
        {viewsCount != null && viewsCount > 0 && (
          <span className="absolute bottom-[10px] left-[10px] text-[12px] text-[var(--text-primary)] drop-shadow-md">
            {viewsCount} просмотров
          </span>
        )}
      </Link>

      <div className="mt-[var(--space-element)] space-y-[var(--space-element)]">
        {/* 2. Цена — ТЗ-3 п.6 */}
        <div className="text-price">
          {formatPrice(pricePerNight)} ₽ <span className="text-small">/ ночь</span>
        </div>

        {/* 3. Город */}
        {city && (
          <p className="text-small">{city}</p>
        )}

        {/* 4. Параметры */}
        {params && (
          <p className="text-muted text-[12px]">{params}</p>
        )}

        {/* 5. AI блок — ТЗ-3 п.7 */}
        {matchPercent != null && (
          <div
            className="rounded-[12px] p-[10px] text-[14px]"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
            }}
          >
            Подходит на {matchPercent}%
          </div>
        )}

        {/* 6. Кнопки — ТЗ-3 п.8 единый стиль */}
        <div className="flex gap-[var(--space-element)] pt-1">
          <Link
            href={`/listings/${id}`}
            className={cn(
              'btn btn--primary btn--md flex-1 flex items-center justify-center'
            )}
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  )
}

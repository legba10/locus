'use client'

import { useState } from 'react'
import { formatPrice, RU } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'

const MAX_GUESTS = 16

export interface ListingBookingProps {
  listingId: string
  pricePerNight: number
  maxGuests?: number
  onConfirm?: (data: { checkIn: Date; checkOut: Date; guests: number }) => void
}

export function ListingBooking({ listingId, pricePerNight, maxGuests = MAX_GUESTS, onConfirm }: ListingBookingProps) {
  const [checkIn, setCheckIn] = useState<string>('')
  const [checkOut, setCheckOut] = useState<string>('')
  const [guests, setGuests] = useState<number>(1)

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  const total = nights * pricePerNight
  const canConfirm = checkIn && checkOut && guests >= 1
  const effectiveMax = Math.min(maxGuests, MAX_GUESTS)

  return (
    <div
      className={cn(
        'max-w-[320px] w-full',
        'bg-[var(--bg-card)] rounded-[20px] p-4 md:p-6',
        'border border-[var(--border)] shadow-[var(--shadow-card)]'
      )}
    >
      <h2 className="text-[20px] font-bold text-[var(--text-main)] mb-4">Бронирование</h2>
      <p className="text-[14px] text-[var(--text-secondary)] mb-4">
        Выберите даты заезда и выезда, количество гостей.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Заезд</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full h-12 rounded-[12px] px-4 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Выезд</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className="w-full h-12 rounded-[12px] px-4 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] text-[14px]"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Гости</label>
        <div className="flex items-center gap-3 h-12 rounded-[12px] border border-[var(--border)] px-4 bg-[var(--bg-card)]">
          <button
            type="button"
            aria-label="Уменьшить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.max(1, g - 1))
            }}
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-[18px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-glass)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="flex-1 text-center text-[15px] font-semibold tabular-nums text-[var(--text-main)]">{guests}</span>
          <button
            type="button"
            aria-label="Увеличить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.min(effectiveMax, g + 1))
            }}
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-[18px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-glass)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={guests >= effectiveMax}
          >
            +
          </button>
        </div>
      </div>
      {nights > 0 && (
        <div className="rounded-[12px] bg-[var(--bg-glass)] p-4 mb-4 space-y-1">
          <p className="text-[14px] text-[var(--text-secondary)]">
            {formatPrice(pricePerNight, 'night')} × {nights} ночей
          </p>
          <div className="flex justify-between items-baseline pt-2 border-t border-[var(--border)]">
            <span className="text-[14px] font-semibold text-[var(--text-main)]">{RU.price.total}</span>
            <span className="text-[18px] font-bold text-[var(--text-main)]">{formatPrice(total, 'night')}</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          canConfirm &&
          onConfirm?.({
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
          })
        }
        disabled={!canConfirm}
        className={cn(
          'w-full px-5 py-3 h-12 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px]',
          'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Забронировать
      </button>
    </div>
  )
}

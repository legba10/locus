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
        'w-full md:max-w-[360px]',
        'rounded-2xl bg-[var(--card)] md:bg-[var(--bg-card)] shadow-md p-4',
        'border border-[var(--border)]',
        'flex flex-col gap-3'
      )}
    >
      <h2 className="text-[20px] font-bold text-[var(--text-main)]">Бронирование</h2>
      <p className="text-[14px] text-[var(--text-secondary)]">
        Выберите даты заезда и выезда, количество гостей.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-full">
        <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--bg-secondary)] md:bg-[var(--bg-card)]">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Заезд</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full min-w-0 rounded-lg px-2 py-2 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm"
          />
        </div>
        <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--bg-secondary)] md:bg-[var(--bg-card)]">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Выезд</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className="w-full min-w-0 rounded-lg px-2 py-2 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Гости</label>
        <div className="flex items-center gap-3 h-12 rounded-xl border border-[var(--border)] px-4 bg-[var(--bg-secondary)] md:bg-[var(--bg-card)]">
          <button
            type="button"
            aria-label="Уменьшить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.max(1, g - 1))
            }}
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-glass)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-glass)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={guests >= effectiveMax}
          >
            +
          </button>
        </div>
      </div>
      {nights > 0 && (
        <div className="rounded-xl bg-[var(--bg-glass)] p-4 space-y-1">
          <p className="text-sm text-[var(--text-secondary)]">
            {formatPrice(pricePerNight, 'night')} × {nights} ночей
          </p>
          <div className="flex justify-between items-baseline pt-2 border-t border-[var(--border)]">
            <span className="text-sm font-semibold text-[var(--text-main)]">{RU.price.total}</span>
            <span className="text-lg font-semibold text-[var(--text-main)]">{formatPrice(total, 'night')}</span>
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
          'w-full h-12 rounded-xl font-medium text-[var(--button-primary-text)]',
          'bg-[var(--accent)] md:bg-[var(--accent)]',
          'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
          'mb-4 md:mb-0'
        )}
      >
        Забронировать
      </button>
    </div>
  )
}

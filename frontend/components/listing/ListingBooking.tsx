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

  const serviceFee = 0
  const totalWithService = total + serviceFee

  return (
    <div
      className={cn(
        'booking-card booking-card-tz8 w-full max-w-[360px] box-border',
        'rounded-[20px] border border-[var(--border)] p-5',
        'bg-[var(--card-bg)]',
        'shadow-[var(--shadow-card)]',
        'flex flex-col gap-4 overflow-hidden'
      )}
    >
      <h2 className="text-[20px] font-bold text-[var(--text-main)]">Бронирование</h2>
      <p className="text-[14px] text-[var(--text-secondary)]">
        Выберите даты заезда и выезда, количество гостей.
      </p>

      {/* ТЗ-8: даты — grid 1fr 1fr, gap 8px, высота 56px, border-radius 12px */}
      <div className="booking-dates booking-dates-tz8" role="group" aria-label="Даты заезда и выезда">
        <div className="booking-date-field booking-date--checkin">
          <label id="booking-checkin-label" className="block text-sm font-medium text-[var(--text-secondary)] mb-1" htmlFor="booking-checkin-input">
            Заезд
          </label>
          <input
            id="booking-checkin-input"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            aria-label="Дата заезда"
            aria-describedby="booking-checkin-label"
            className="booking-date-input w-full min-w-0 box-border"
          />
        </div>
        <div className="booking-date-field booking-date--checkout">
          <label id="booking-checkout-label" className="block text-sm font-medium text-[var(--text-secondary)] mb-1" htmlFor="booking-checkout-input">
            Выезд
          </label>
          <input
            id="booking-checkout-input"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            aria-label="Дата выезда"
            aria-describedby="booking-checkout-label"
            className="booking-date-input w-full min-w-0 box-border"
          />
        </div>
      </div>
      <div className="guests-control min-w-0">
        <label id="booking-guests-label" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Гости</label>
        <div className="flex items-center gap-3 h-12 rounded-[12px] border border-[var(--border)] px-4 bg-[var(--card-bg)]">
          <button
            type="button"
            aria-label="Уменьшить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.max(1, g - 1))
            }}
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-lg font-medium text-[var(--text-main)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--card-bg)]"
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
            className="w-9 h-9 rounded-lg border border-[var(--border)] text-lg font-medium text-[var(--text-main)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--card-bg)]"
            disabled={guests >= effectiveMax}
          >
            +
          </button>
        </div>
      </div>

      {/* ТЗ-8: цена крупно, затем структура цена × ночи, сервис, итог */}
      <div className="booking-price-block-tz8">
        <p className="text-[20px] font-bold text-[var(--text-main)]">
          {formatPrice(pricePerNight, 'night')}
        </p>
        {nights > 0 && (
          <div className="booking-price-breakdown-tz8 mt-3 space-y-1.5">
            <div className="flex justify-between text-[14px] text-[var(--text-main)]">
              <span>{formatPrice(pricePerNight, 'night')} × {nights} {nights === 1 ? 'ночь' : 'ночей'}</span>
              <span>{formatPrice(nights * pricePerNight, 'night')}</span>
            </div>
            {serviceFee > 0 && (
              <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
                <span>Сервисный сбор</span>
                <span>{formatPrice(serviceFee, 'night')}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-[var(--border)] text-[16px] font-semibold text-[var(--text-main)]">
              <span>{RU.price.total}</span>
              <span>{formatPrice(totalWithService, 'night')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="booking-actions mt-1">
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
          aria-disabled={!canConfirm}
          aria-label="Забронировать"
          className={cn(
            'booking-btn w-full min-w-0 h-[52px] rounded-[14px] font-semibold text-[16px] border-0',
            'bg-[var(--accent)] text-white',
            'hover:opacity-90 disabled:cursor-not-allowed',
            'transition-opacity duration-200 focus-visible:outline-none'
          )}
        >
          Забронировать
        </button>
      </div>
    </div>
  )
}

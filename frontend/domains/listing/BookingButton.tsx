'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { apiFetchJson } from '@/shared/api/client'

interface BookingButtonProps {
  listingId: string
  price: number
  variant?: 'primary' | 'secondary'
}

/**
 * BookingButton — Кнопка бронирования с flow выбора даты
 */
export function BookingButton({ listingId, price, variant = 'primary' }: BookingButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (showBookingModal) document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [showBookingModal])

  const handleBooking = async () => {
    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/listings/' + listingId)
      return
    }

    if (!checkIn || !checkOut) {
      setShowBookingModal(true)
      return
    }

    setLoading(true)

    try {
      await apiFetchJson<{ item?: unknown }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          listingId,
          from: checkIn,
          to: checkOut,
          guests,
        }),
      })
      alert('Заявка на бронирование отправлена владельцу!')
      setShowBookingModal(false)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Не удалось отправить заявку. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          if (!isAuthenticated()) {
            router.push('/auth/login?redirect=/listings/' + listingId)
            return
          }
          setShowBookingModal(true)
        }}
        className={cn(
          'w-full px-5 py-3 rounded-[14px] font-semibold text-[15px]',
          variant === 'primary'
            ? 'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-90 active:opacity-80 shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
            : 'bg-[var(--button-secondary-bg)] text-[var(--text-primary)] border-2 border-[var(--border)] hover:opacity-90',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        disabled={loading}
      >
        {loading ? 'Отправка...' : 'Забронировать'}
      </button>

      {/* Модальное окно бронирования — ТЗ-2: overlay (z-overlay) + panel (z-modal) */}
      {showBookingModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 'var(--z-overlay)' }}>
          <div className="overlay" onClick={() => setShowBookingModal(false)} aria-hidden />
          <div className={cn(
            'relative rounded-[20px] p-6 max-w-md w-full modal-panel bg-[var(--bg-modal)]',
            'shadow-[var(--shadow-modal)]'
          )} style={{ zIndex: 'var(--z-modal)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-[#1C1F26]">Бронирование</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-[#6B7280] hover:text-[#1C1F26]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Дата заезда</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-[var(--border)] bg-[var(--input-bg)]',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Дата выезда</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-[var(--border)] bg-[var(--input-bg)]',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Гостей</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min={1}
                  max={10}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-[var(--border)] bg-[var(--input-bg)]',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[#6B7280]">Итого</span>
                  <span className="text-[18px] font-bold text-[#1C1F26]">
                    {checkIn && checkOut
                      ? `${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) * price} ₽`
                      : '—'}
                  </span>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || loading}
                  className={cn(
                    'w-full py-3 rounded-[14px]',
                    'bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px]',
                    'hover:bg-violet-500 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

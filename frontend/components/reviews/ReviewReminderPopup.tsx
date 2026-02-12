'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getPendingReminders,
  isDismissed,
  isPostponed,
  isReminderDisabled,
  setDismissed,
  setPostponed,
  setReminderDisabled,
  HOURS_AFTER_CHECKOUT,
} from '@/shared/reviews/reviewReminderStorage'
import { cn } from '@/shared/utils/cn'

export function ReviewReminderPopup() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [reminder, setReminder] = useState<{ bookingId: string; listingId: string; checkOut: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    if (isReminderDisabled()) {
      setReminder(null)
      return
    }
    const list = getPendingReminders()
    const now = Date.now()
    const afterMs = HOURS_AFTER_CHECKOUT * 60 * 60 * 1000
    const next = list.find((r) => {
      const out = new Date(r.checkOut).getTime()
      if (out + afterMs > now) return false
      if (isDismissed(r.bookingId)) return false
      if (isPostponed(r.bookingId)) return false
      return true
    })
    setReminder(next ?? null)
  }, [mounted])

  if (!reminder) return null

  const handleLeaveReview = () => {
    setDismissed(reminder.bookingId)
    setReminder(null)
    router.push(`/listings/${reminder.listingId}#review-form`)
  }

  const handleLater = () => {
    setPostponed(reminder.bookingId)
    setReminder(null)
  }

  const handleDisable = () => {
    setReminderDisabled()
    setReminder(null)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-reminder-title"
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-xl max-w-sm w-full p-6',
          'border border-gray-100'
        )}
      >
        <h2 id="review-reminder-title" className="text-[18px] font-bold text-[#1C1F26] mb-2">
          Как прошло проживание?
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-5">
          Ваш отзыв поможет другим выбрать жильё
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLeaveReview}
            className="min-h-[44px] w-full rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
          >
            Оставить отзыв
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="min-h-[44px] w-full rounded-[14px] border border-gray-200 bg-white text-[14px] font-medium text-[#1C1F26] hover:bg-gray-50"
          >
            Позже
          </button>
        </div>
        <button
          type="button"
          onClick={handleDisable}
          className="mt-4 w-full text-[12px] text-[#9CA3AF] hover:text-[#6B7280]"
        >
          Не показывать напоминания
        </button>
      </div>
    </div>
  )
}

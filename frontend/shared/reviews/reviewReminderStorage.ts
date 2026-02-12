/**
 * Client-only storage for review reminder gamification (ТЗ 3).
 * No backend; can be disabled in "settings" (localStorage).
 */

const KEY_QUEUE = 'review_reminder_queue'
const KEY_DISMISSED = (id: string) => `review_reminder_dismissed_${id}`
const KEY_POSTPONED = (id: string) => `review_reminder_postponed_${id}`
const KEY_DISABLED = 'review_reminder_disabled'
const KEY_COUNT = 'review_submitted_count'

export const HOURS_AFTER_CHECKOUT = 2
export const POSTPONE_HOURS = 24

export type PendingReminder = {
  bookingId: string
  listingId: string
  checkOut: string
}

export function getPendingReminders(): PendingReminder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY_QUEUE)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function addPendingReminder(reminder: PendingReminder): void {
  try {
    const list = getPendingReminders()
    if (list.some((r) => r.bookingId === reminder.bookingId)) return
    list.push(reminder)
    localStorage.setItem(KEY_QUEUE, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export function removePendingReminder(bookingId: string): void {
  try {
    const list = getPendingReminders().filter((r) => r.bookingId !== bookingId)
    localStorage.setItem(KEY_QUEUE, JSON.stringify(list))
    localStorage.removeItem(KEY_DISMISSED(bookingId))
    localStorage.removeItem(KEY_POSTPONED(bookingId))
  } catch {
    // ignore
  }
}

export function isDismissed(bookingId: string): boolean {
  try {
    return localStorage.getItem(KEY_DISMISSED(bookingId)) === '1'
  } catch {
    return true
  }
}

export function setDismissed(bookingId: string): void {
  try {
    localStorage.setItem(KEY_DISMISSED(bookingId), '1')
    removePendingReminder(bookingId)
  } catch {
    // ignore
  }
}

export function isPostponed(bookingId: string): boolean {
  try {
    const raw = localStorage.getItem(KEY_POSTPONED(bookingId))
    if (!raw) return false
    const until = Number(raw)
    return Date.now() < until
  } catch {
    return false
  }
}

export function setPostponed(bookingId: string): void {
  try {
    localStorage.setItem(KEY_POSTPONED(bookingId), String(Date.now() + POSTPONE_HOURS * 60 * 60 * 1000))
  } catch {
    // ignore
  }
}

export function isReminderDisabled(): boolean {
  try {
    return localStorage.getItem(KEY_DISABLED) === '1'
  } catch {
    return false
  }
}

export function setReminderDisabled(): void {
  try {
    localStorage.setItem(KEY_DISABLED, '1')
  } catch {
    // ignore
  }
}

export function getReviewSubmittedCount(): number {
  try {
    const raw = localStorage.getItem(KEY_COUNT)
    if (!raw) return 0
    return Math.max(0, parseInt(raw, 10) || 0)
  } catch {
    return 0
  }
}

export function incrementReviewSubmittedCount(): number {
  try {
    const n = getReviewSubmittedCount() + 1
    localStorage.setItem(KEY_COUNT, String(n))
    return n
  } catch {
    return 0
  }
}

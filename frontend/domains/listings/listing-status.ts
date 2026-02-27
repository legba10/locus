/**
 * TZ-65: Статусы объявления (канонические с бэкенда).
 * draft → pending (moderation) → approved (published) | rejected
 * approved → archived (снять с публикации)
 */

export type ListingStatusCanonical =
  | 'draft'
  | 'pending'   // moderation / PENDING_REVIEW
  | 'approved'  // published
  | 'rejected'
  | 'archived'

export const LISTING_STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  pending: 'На модерации',
  moderation: 'На модерации',
  approved: 'Опубликовано',
  published: 'Опубликовано',
  rejected: 'Отклонено',
  archived: 'Архив',
}

export function toCanonicalStatus(apiStatus: string | undefined): ListingStatusCanonical {
  if (!apiStatus) return 'draft'
  const s = String(apiStatus).toLowerCase()
  if (s === 'published') return 'approved'
  if (s === 'pending_review' || s === 'moderation' || s === 'awaiting_payment') return 'pending'
  if (s === 'rejected') return 'rejected'
  if (s === 'archived' || s === 'blocked') return 'archived'
  return 'draft'
}

'use client'

import { cn } from '@/shared/utils/cn'

export interface StickyActionsProps {
  price?: number
  onWrite: () => void
  onBook: () => void
  onSave: () => void
  isSaved: boolean
  writeLoading?: boolean
}

export function StickyActions({
  price,
  onWrite,
  onBook,
  onSave,
  isSaved,
  writeLoading = false,
}: StickyActionsProps) {
  return (
    <>
      {/* ТЗ-7 Mobile: fixed bottom, height 72px, z-index 50; цена | написать | забронировать */}
      <div
        className={cn(
          'fixed left-0 right-0 z-[50]',
          'h-[72px] flex items-center gap-3 px-4',
          'backdrop-blur-[20px] bg-[var(--bg-glass)] border-t border-[var(--border)]',
          'md:hidden'
        )}
        style={{ bottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {price != null && price > 0 && (
          <span className="text-[15px] font-bold shrink-0" style={{ color: '#7c5cff' }}>
            от {price.toLocaleString('ru-RU')} ₽
          </span>
        )}
        <button
          type="button"
          onClick={onWrite}
          disabled={writeLoading}
          className="flex-1 min-h-[48px] h-12 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] disabled:opacity-50 disabled:pointer-events-none"
        >
          {writeLoading ? '…' : 'Написать'}
        </button>
        <button
          type="button"
          onClick={onBook}
          className="flex-1 min-h-[48px] h-12 rounded-[14px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px]"
        >
          Забронировать
        </button>
        <button
          type="button"
          onClick={onSave}
          className="shrink-0 w-12 h-12 rounded-[14px] border-2 border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center"
          aria-label={isSaved ? 'Убрать из избранного' : 'В избранное'}
        >
          <svg className={cn('w-5 h-5', isSaved ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]')} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* ТЗ-7 Desktop: width 360px, sticky top 100px; кнопки height 52px, radius 14px */}
      <div
        className={cn(
          'hidden md:block w-[360px] flex-shrink-0',
          'sticky top-[100px] self-start'
        )}
      >
        <div className="listing-sticky-card-tz3 rounded-[20px] border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
          {price != null && price > 0 && (
            <p className="text-[28px] font-bold mb-4" style={{ color: '#7c5cff' }}>
              {price.toLocaleString('ru-RU')} ₽
              <span className="text-[14px] font-normal text-[var(--text-secondary)]"> / ночь</span>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onWrite}
              disabled={writeLoading}
              className="w-full h-[52px] min-h-[52px] rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] disabled:opacity-70"
            >
              {writeLoading ? '…' : 'Написать'}
            </button>
            <button
              type="button"
              onClick={onBook}
              className="w-full h-[52px] min-h-[52px] rounded-[14px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px]"
            >
              Забронировать
            </button>
            <button
              type="button"
              onClick={onSave}
              className="w-full h-[52px] min-h-[52px] rounded-[14px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-medium text-[14px] flex items-center justify-center gap-2"
            >
              <svg className={cn('w-5 h-5', isSaved && 'fill-red-500 text-red-500')} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isSaved ? 'В избранном' : 'В избранное'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

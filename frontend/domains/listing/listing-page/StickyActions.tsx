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
      {/* Mobile: фикс снизу 72px, backdrop-blur */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[var(--z-bottom-bar)]',
          'h-[72px] flex items-center gap-2 px-4',
          'backdrop-blur-[var(--blur-glass)] bg-[var(--bg-glass)] border-t border-[var(--border)]',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          'md:hidden'
        )}
      >
        {price != null && price > 0 && (
          <span className="text-[13px] font-semibold text-[var(--text-main)] shrink-0">
            от {price.toLocaleString('ru-RU')} ₽
          </span>
        )}
        <button
          type="button"
          onClick={onWrite}
          disabled={writeLoading}
          className="flex-1 min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] disabled:opacity-70"
        >
          {writeLoading ? '…' : 'Написать'}
        </button>
        <button
          type="button"
          onClick={onBook}
          className="flex-1 min-h-[48px] rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px]"
        >
          Забронировать
        </button>
        <button
          type="button"
          onClick={onSave}
          className="shrink-0 w-12 h-12 rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center"
          aria-label={isSaved ? 'Убрать из избранного' : 'В избранное'}
        >
          <svg className={cn('w-5 h-5', isSaved ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]')} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Desktop: плавающий блок справа 320px sticky top 100px */}
      <div
        className={cn(
          'hidden md:block w-[320px] flex-shrink-0',
          'sticky top-[100px] self-start'
        )}
      >
        <div className={cn('rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]')}>
          {price != null && price > 0 && (
            <p className="text-[28px] font-bold text-[var(--text-main)] mb-4">
              {price.toLocaleString('ru-RU')} ₽
              <span className="text-[14px] font-normal text-[var(--text-secondary)]"> / ночь</span>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onWrite}
              disabled={writeLoading}
              className="w-full min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] disabled:opacity-70"
            >
              {writeLoading ? '…' : 'Написать'}
            </button>
            <button
              type="button"
              onClick={onBook}
              className="w-full min-h-[48px] rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px]"
            >
              Забронировать
            </button>
            <button
              type="button"
              onClick={onSave}
              className="w-full min-h-[48px] rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-medium text-[14px] flex items-center justify-center gap-2"
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

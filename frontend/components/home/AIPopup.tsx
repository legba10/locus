'use client'

const STORAGE_KEY = 'ai_popup_closed'

export function getAIPopupClosed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function setAIPopupClosed(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, '1')
}

export interface AIPopupProps {
  open: boolean
  onClose: () => void
  onStart?: () => void
  /** Текст кнопки */
  primaryButtonText?: string
}

/**
 * ТЗ-2: карточка AI-подбора с крестиком и закрытием через localStorage.
 */
export function AIPopup({
  open,
  onClose,
  onStart,
  primaryButtonText = 'Начать',
}: AIPopupProps) {
  if (!open) return null

  const handleClose = () => {
    setAIPopupClosed()
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[var(--z-overlay)]" aria-modal="true" role="dialog">
      <div className="overlay" onClick={handleClose} aria-hidden />
      <div
        className="relative rounded-2xl bg-[#0b1228] p-6 w-full max-w-[420px] border border-white/10 shadow-xl z-[var(--z-modal)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Закрыть"
        >
          <span className="text-lg leading-none">×</span>
        </button>
        <h3 className="text-[22px] font-bold text-white pr-10">Найдём жильё под ваш бюджет</h3>
        <p className="mt-2 text-[14px] text-white/70">AI анализирует рынок и подбирает варианты</p>
        {onStart && (
          <button
            type="button"
            className="mt-5 w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium hover:opacity-90 transition"
            onClick={onStart}
          >
            {primaryButtonText}
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

interface PublishStepProps {
  isSubmitting: boolean
  onPublish: () => void
}

export function PublishStep({ isSubmitting, onPublish }: PublishStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Публикация</h3>
      <p className="text-[14px] text-[var(--text-secondary)]">
        После публикации объявление отправится на модерацию. Для администраторов публикация доступна без очереди.
      </p>
      <button
        type="button"
        onClick={onPublish}
        disabled={isSubmitting}
        className="rounded-[12px] px-5 py-3 bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] disabled:opacity-60"
      >
        {isSubmitting ? 'Публикация…' : 'Опубликовать'}
      </button>
    </div>
  )
}

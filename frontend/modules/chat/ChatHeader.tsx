'use client'

export interface ChatHeaderProps {
  title: string
  onBack?: () => void
  statusLabel?: string
  avatarUrl?: string | null
}

export function ChatHeader({ title, onBack, statusLabel, avatarUrl }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      {onBack && (
        <button type="button" onClick={onBack} className="chat-header__back" aria-label="Назад">
          ←
        </button>
      )}
      <div className="chat-header__avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="chat-header__avatar-placeholder">{title.slice(0, 1).toUpperCase() || '?'}</span>
        )}
      </div>
      <div className="chat-header__info min-w-0 flex-1">
        <h1 className="chat-header__title truncate">{title}</h1>
        {statusLabel && <p className="chat-header__status">{statusLabel}</p>}
      </div>
    </header>
  )
}

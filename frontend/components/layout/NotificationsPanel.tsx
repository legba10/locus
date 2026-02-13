'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

export interface NotificationItem {
  id: string
  type: string
  title: string
  text?: string | null
  body?: string | null
  link?: string | null
  isRead?: boolean
  isSeen?: boolean
  read?: boolean
  createdAt: string
}

export interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  list: NotificationItem[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  pushStatus: 'idle' | 'loading' | 'ok' | 'denied' | 'no_vapid'
  onEnablePush: () => void
  /** Optional: render as fixed for mobile (e.g. top offset below header) */
  isMobile?: boolean
}

/**
 * ТЗ-8: Панель уведомлений — dropdown сверху (под header), не fullscreen.
 * max-height 420px, scroll внутри. Состояния: новые, прочитанные, нет уведомлений.
 */
export function NotificationsPanel({
  open,
  onClose,
  list,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  pushStatus,
  onEnablePush,
  isMobile = false,
}: NotificationsPanelProps) {
  const router = useRouter()

  if (!open) return null

  const handleItemClick = (n: NotificationItem) => {
    onMarkRead(n.id)
    onClose()
    if (n.link) router.push(n.link)
  }

  const unread = list.filter((n) => !(n.isRead ?? n.read))
  const read = list.filter((n) => n.isRead ?? n.read)

  return (
    <>
      <div
        className="overlay"
        style={{ zIndex: 'var(--z-overlay)' }}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-hidden
      />
      <div
        className={cn(
          'notifications-panel flex flex-col',
          isMobile
            ? 'fixed left-4 right-4 top-[72px] w-[calc(100%-32px)] max-h-[420px] overflow-hidden rounded-[14px]'
            : 'absolute right-0 top-full mt-1 w-[320px] max-h-[420px] overflow-hidden rounded-[14px]'
        )}
        style={{ zIndex: 'var(--z-notification-panel)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <span className="text-[14px] font-semibold text-[var(--text-main)]">Уведомления</span>
          {unreadCount > 0 && (
            <button type="button" onClick={onMarkAllRead} className="text-[12px] text-[var(--accent)] hover:opacity-90">
              Отметить всё
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 360 }}>
          {list.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[var(--text-secondary)]">Нет уведомлений</div>
          ) : (
            <>
              {unread.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">Новые</div>
                  {unread.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className="w-full text-left px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors bg-[var(--accent-soft)]/50"
                    >
                      <p className="text-[13px] font-medium text-[var(--text-main)]">{n.title}</p>
                      {(n.text || n.body) && (
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.text || n.body}</p>
                      )}
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
                    </button>
                  ))}
                </>
              )}
              {read.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">Прочитанные</div>
                  {read.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className="w-full text-left px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition-colors"
                    >
                      <p className="text-[13px] font-medium text-[var(--text-main)]">{n.title}</p>
                      {(n.text || n.body) && (
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.text || n.body}</p>
                      )}
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
        <div className="border-t border-[var(--border)] px-4 py-2 bg-[var(--bg-card)]">
          <button
            type="button"
            disabled={pushStatus === 'loading' || !('Notification' in (typeof window !== 'undefined' ? window : {}))}
            onClick={onEnablePush}
            className="text-[12px] text-[var(--accent)] hover:opacity-90 disabled:opacity-50"
          >
            {pushStatus === 'loading'
              ? '…'
              : pushStatus === 'ok'
                ? 'Браузерные уведомления включены'
                : pushStatus === 'no_vapid'
                  ? 'Нужны VAPID ключи'
                  : 'Включить уведомления в браузере'}
          </button>
        </div>
      </div>
    </>
  )
}

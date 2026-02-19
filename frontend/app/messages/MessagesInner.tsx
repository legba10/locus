'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { cn } from '@/shared/utils/cn'

type ChatItem = {
  id: string
  listingTitle?: string
  listingPhotoUrl?: string
  host: { id: string; profile?: { name?: string | null; avatarUrl?: string | null } | null }
  guest: { id: string; profile?: { name?: string | null; avatarUrl?: string | null } | null }
  messages: Array<{ text: string; createdAt: string; senderId: string }>
  unreadCount?: number
  updatedAt: string
}

/**
 * ТЗ-11: Вся логика с useSearchParams/useRouter — только внутри Suspense (MessagesInner).
 * Предотвращает React 418/423 и ошибки prerender на /messages.
 */
export default function MessagesInner() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = searchParams.get('chat') ?? ''
  const suggestedCheckIn = searchParams.get('checkIn') ?? undefined
  const suggestedCheckOut = searchParams.get('checkOut') ?? undefined
  const { isAuthenticated, user } = useAuthStore()
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: isAuthenticated() })
  const currentUserId = user?.id ?? ''

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const openChat = (chatId: string) => {
    router.replace(`/messages?chat=${encodeURIComponent(chatId)}`)
  }

  const goBack = () => {
    router.replace('/messages')
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--card-bg)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-main)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[var(--accent)] hover:underline text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  /** ТЗ-5: skeleton пока грузится user (избегаем console error при undefined user) */
  if (user === undefined) {
    return (
      <div className="flex flex-col bg-[var(--card-bg)] h-full min-h-0" style={{ top: 'var(--header-height, 56px)', height: 'calc(100vh - var(--header-height, 56px))' }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" aria-hidden />
        </div>
      </div>
    )
  }

  /* ТЗ-11: Мобилка — при выбранном чате показываем только чат, кнопка назад */
  const isMobileChatOpen = !!activeChatId

  return (
    <div
      className={cn(
        'messages-page-tz11 flex flex-col md:grid bg-[var(--card-bg)] fixed left-0 right-0 z-[5]',
        'bottom-0 md:bottom-0',
        isMobileChatOpen ? 'md:grid-cols-[320px_1fr]' : 'md:grid-cols-[320px_1fr]'
      )}
      style={{
        top: 'var(--header-height, 56px)',
        height: 'calc(100vh - var(--header-height, 56px))',
        overflow: 'hidden',
      }}
    >
      {/* Левая колонка: список диалогов — скролл внутри, фиксированная ширина */}
      <aside
        className={cn(
          'flex flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--card-bg)]',
          isMobileChatOpen ? 'hidden md:flex md:w-[320px]' : 'w-full md:w-[320px]'
        )}
      >
        <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border)]">
          <h1 className="text-[18px] font-bold text-[var(--text-main)]">Сообщения</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : Array.isArray(chats) && chats.length > 0 ? (
            <div className="py-2">
              {(chats ?? []).filter(Boolean).map((c) => {
                if (!c || typeof c !== 'object') return null
                const last = Array.isArray(c.messages) ? c.messages[0] : undefined
                const hostId = c.host?.id ?? ''
                const isHost = hostId === currentUserId
                const other = isHost ? c.guest : c.host
                const name = (other?.profile?.name ?? '').toString().trim() || 'Пользователь'
                const avatarUrl = other?.profile?.avatarUrl ?? null
                /** ТЗ-7: карточка диалога — фото объявления приоритетнее, затем аватар */
                const photoUrl = c.listingPhotoUrl || avatarUrl || null
                const isActive = c.id === activeChatId
                const listingTitle = (c.listingTitle ?? '').toString().trim()
                const dateLabel = last
                  ? (() => {
                      const d = new Date(last.createdAt)
                      const today = new Date()
                      if (d.toDateString() === today.toDateString()) return 'сегодня'
                      const yesterday = new Date(today)
                      yesterday.setDate(yesterday.getDate() - 1)
                      if (d.toDateString() === yesterday.toDateString()) return 'вчера'
                      return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
                    })()
                  : null
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openChat(c.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isActive ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--bg-secondary)]'
                    )}
                  >
                    <div className="relative w-14 h-14 rounded-xl bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {photoUrl && typeof photoUrl === 'string' ? (
                        <Image src={photoUrl} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <span className="text-[16px] font-semibold text-[var(--text-secondary)]">
                          {(name || 'П').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[var(--text-main)] truncate">{name}</div>
                      {listingTitle && (
                        <div className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">{listingTitle}</div>
                      )}
                      {last && (
                        <div className="text-[13px] text-[var(--text-muted)] truncate mt-0.5">{last.text}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {dateLabel && (
                        <span className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{dateLabel}</span>
                      )}
                      {(c.unreadCount ?? 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[11px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              }).filter(Boolean)}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[14px] text-[var(--text-main)] font-medium">У вас пока нет сообщений</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2">Начните диалог через объявление</p>
            </div>
          )}
        </div>
      </aside>

      {/* Правая колонка (ПК) или полноэкранный чат (мобилка при открытом диалоге). TZ-21: pb под нижнее меню на mobile. */}
      <div className={cn('flex-1 min-w-0 min-h-0 flex flex-col chat-column-mobile-pb md:pb-0', isMobileChatOpen ? 'flex' : 'hidden md:flex')}>
        {activeChatId ? (
          <div className="flex flex-col h-full min-h-0">
            <ChatPanel
              chatId={activeChatId}
              onBack={goBack}
              embedded
              suggestedCheckIn={suggestedCheckIn}
              suggestedCheckOut={suggestedCheckOut}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <p className="text-[15px] text-[var(--text-secondary)]">Выберите диалог или начните новый</p>
          </div>
        )}
      </div>
    </div>
  )
}

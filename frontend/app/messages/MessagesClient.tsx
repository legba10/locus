'use client'

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

export default function MessagesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = searchParams.get('chat') ?? ''
  const suggestedCheckIn = searchParams.get('checkIn') ?? undefined
  const suggestedCheckOut = searchParams.get('checkOut') ?? undefined
  const { isAuthenticated, user } = useAuthStore()
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: isAuthenticated() })
  const currentUserId = user?.id ?? ''

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

  /* ТЗ-11: Мобилка — при выбранном чате показываем только чат, кнопка назад */
  const isMobileChatOpen = !!activeChatId

  return (
    <div
      className={cn(
        'messages-page-tz11 flex flex-col md:grid bg-[var(--card-bg)] fixed left-0 right-0 bottom-0 z-[5]',
        isMobileChatOpen ? 'md:grid-cols-[320px_1fr]' : 'md:grid-cols-[320px_1fr]'
      )}
      style={{
        top: 'var(--header-height, 64px)',
        height: 'calc(100vh - var(--header-height, 64px))',
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
              {chats.map((c) => {
                const last = c.messages?.[0]
                const isHost = c.host?.id === currentUserId
                const other = isHost ? c.guest : c.host
                const name = other?.profile?.name?.trim() || 'Пользователь'
                const avatarUrl = other?.profile?.avatarUrl
                const photoUrl = avatarUrl || c.listingPhotoUrl
                const isActive = c.id === activeChatId
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
                    <div className="relative w-12 h-12 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {photoUrl ? (
                        <Image src={photoUrl} alt="" fill className="object-cover" sizes="48px" />
                      ) : (
                        <span className="text-[14px] font-semibold text-[var(--text-secondary)]">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[var(--text-main)] truncate">{name}</div>
                      {last && (
                        <div className="text-[13px] text-[var(--text-secondary)] truncate mt-0.5">{last.text}</div>
                      )}
                    </div>
                    {last && (
                      <div className="text-[11px] text-[var(--text-secondary)] flex-shrink-0">
                        {new Date(last.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                    {(c.unreadCount ?? 0) > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[14px] text-[var(--text-secondary)]">Пока нет сообщений</p>
            </div>
          )}
        </div>
      </aside>

      {/* Правая колонка (ПК) или полноэкранный чат (мобилка при открытом диалоге) */}
      <div className={cn('flex-1 min-w-0 min-h-0 flex flex-col', isMobileChatOpen ? 'flex' : 'hidden md:flex')}>
        {activeChatId ? (
          <ChatPanel
            chatId={activeChatId}
            onBack={goBack}
            embedded
            suggestedCheckIn={suggestedCheckIn}
            suggestedCheckOut={suggestedCheckOut}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <p className="text-[15px] text-[var(--text-secondary)]">Выберите диалог или начните новый</p>
          </div>
        )}
      </div>
    </div>
  )
}

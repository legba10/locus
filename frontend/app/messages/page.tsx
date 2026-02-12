'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
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

export default function MessagesPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: isAuthenticated() })
  const currentUserId = user?.id ?? ''

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8 max-w-[920px]">
        <h1 className="text-[24px] font-bold text-[#1C1F26] mb-6">Сообщения</h1>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-[18px] animate-pulse" />
            ))}
          </div>
        ) : Array.isArray(chats) && chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((c) => {
              const last = c.messages?.[0]
              const isHost = c.host?.id === currentUserId
              const other = isHost ? c.guest : c.host
              const name = other?.profile?.name?.trim() || 'Пользователь'
              const avatarUrl = other?.profile?.avatarUrl
              const photoUrl = avatarUrl || c.listingPhotoUrl
              return (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-[18px] bg-white border border-gray-100/80',
                    'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-violet-200'
                  )}
                >
                  <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {photoUrl ? (
                      <Image src={photoUrl} alt="" fill className="object-cover" sizes="56px" />
                    ) : (
                      <span className="text-[16px] font-semibold text-[#4B5563]">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#1C1F26] truncate">{name}</div>
                    {c.listingTitle && (
                      <div className="text-[13px] text-[#6B7280] truncate">{c.listingTitle}</div>
                    )}
                    {last && (
                      <div className="text-[13px] text-[#9CA3AF] truncate mt-0.5">{last.text}</div>
                    )}
                  </div>
                  {(c.unreadCount ?? 0) > 0 && (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-[12px] font-bold flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className={cn(
            'bg-white rounded-[18px] p-8 text-center',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <p className="text-[15px] font-medium text-[var(--text-main)]">Пока нет сообщений</p>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">Начните диалог</p>
          </div>
        )}
      </div>
    </div>
  )
}

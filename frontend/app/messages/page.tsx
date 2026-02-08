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
  host: { id: string; profile?: { name?: string | null } | null }
  guest: { id: string; profile?: { name?: string | null } | null }
  messages: Array<{ text: string; createdAt: string; senderId: string }>
  unreadCount?: number
  updatedAt: string
}

export default function MessagesPage() {
  const { isAuthenticated } = useAuthStore()
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: isAuthenticated() })

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
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
              const name = c.host?.profile?.name || c.guest?.profile?.name || 'Чат'
              return (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-[18px] bg-white border border-gray-100/80',
                    'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-violet-200'
                  )}
                >
                  <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {c.listingPhotoUrl ? (
                      <Image src={c.listingPhotoUrl} alt="" fill className="object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-[20px]">💬</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#1C1F26] truncate">{c.listingTitle || name}</div>
                    {last && (
                      <div className="text-[13px] text-[#6B7280] truncate">{last.text}</div>
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
            <p className="text-[15px] text-[#6B7280]">
              Чаты появятся, когда вы напишете владельцу объявления (кнопка «Написать» на странице объявления).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

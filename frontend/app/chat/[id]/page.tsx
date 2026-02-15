'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { ChatPanel } from '@/components/chat/ChatPanel'

export default function ChatPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id ?? ''
  const { isAuthenticated } = useAuthStore()
  const suggestedCheckIn = searchParams.get('checkIn') ?? undefined
  const suggestedCheckOut = searchParams.get('checkOut') ?? undefined

  if (!isAuthenticated()) {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/chat/${id}`)}`)
    return null
  }

  if (!id) {
    router.push('/messages')
    return null
  }

  return (
    <div
      className="messages-chat-page-tz11 fixed left-0 right-0 bottom-0 z-[10] bg-[var(--card-bg)]"
      style={{ top: 'var(--header-height, 64px)' }}
    >
      <ChatPanel
        chatId={id}
        onBack={() => router.push('/messages')}
        suggestedCheckIn={suggestedCheckIn}
        suggestedCheckOut={suggestedCheckOut}
      />
    </div>
  )
}

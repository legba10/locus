'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/utils/cn'

/**
 * ТЗ №2: аватар пользователя в header — 36×36px, круг.
 * Инициалы при отсутствии фото; градиент фона.
 */
export interface UserAvatarProps {
  user?: {
    avatar_url?: string | null
    full_name?: string | null
    username?: string | null
    name?: string | null
  } | null
  onClick?: () => void
  className?: string
  asButton?: boolean
  ariaExpanded?: boolean
}

export default function UserAvatar({ user, onClick, className, asButton = true, ariaExpanded }: UserAvatarProps) {
  const [avatarLoadError, setAvatarLoadError] = useState(false)
  const name = user?.full_name ?? user?.name ?? user?.username ?? ''
  const initials = (name?.trim().slice(0, 1) || 'U').toUpperCase()
  const avatarUrl = user?.avatar_url
  const hasValidAvatar = typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && !avatarLoadError

  const sizeStyle = { width: 36, height: 36 } as React.CSSProperties
  const fallbackStyle = {
    ...sizeStyle,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7b61ff, #5b8cff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-on-accent, #fff)',
    fontWeight: 600,
    fontSize: 14,
  } as React.CSSProperties

  const content = hasValidAvatar ? (
    <Image
      src={avatarUrl!}
      alt={name || 'Аватар'}
      width={36}
      height={36}
      className="rounded-full object-cover object-center w-full h-full"
      onError={() => setAvatarLoadError(true)}
    />
  ) : (
    <span style={{ lineHeight: 1 }}>{initials}</span>
  )

  const wrapper = (
    <span
      className={cn('inline-flex items-center justify-center overflow-hidden rounded-full shrink-0', className)}
      style={hasValidAvatar ? sizeStyle : fallbackStyle}
    >
      {content}
    </span>
  )

  if (asButton && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="p-0 border-0 rounded-full bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
        aria-label="Профиль"
        aria-expanded={ariaExpanded ?? undefined}
      >
        {wrapper}
      </button>
    )
  }

  return wrapper
}

'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type MobileMenuPortalProps = {
  isOpen: boolean
  onClose: () => void
  onNavigate: (path: string) => void
  onLogout: () => void
}

export function MobileMenuPortal({
  isOpen,
  onClose,
  onNavigate,
  onLogout,
}: MobileMenuPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="mobile-menu" role="dialog" aria-modal="true">
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-[18px] font-semibold text-[#1C1F26]">Меню</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <button type="button" onClick={() => onNavigate('/listings')} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl hover:bg-gray-50">
          Поиск жилья
        </button>
        <button type="button" onClick={() => onNavigate('/favorites')} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl hover:bg-gray-50">
          Избранное
        </button>
        <button type="button" onClick={() => onNavigate('/messages')} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl hover:bg-gray-50">
          Сообщения
        </button>
        <button type="button" onClick={() => onNavigate('/profile')} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl hover:bg-gray-50">
          Профиль
        </button>
        <button type="button" onClick={() => onNavigate('/pricing')} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl hover:bg-gray-50">
          Тарифы
        </button>
        <button type="button" onClick={onLogout} className="w-full text-left min-h-[48px] px-4 py-3 rounded-xl text-red-600 hover:bg-red-50">
          Выйти
        </button>
      </div>
    </div>,
    document.body
  )
}

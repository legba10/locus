'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export type CabinetTab =
  | 'home'
  | 'listings'
  | 'bookings'
  | 'messages'
  | 'promotion'
  | 'finances'
  | 'profile'
  | 'settings'
  | 'admin'

function RocketIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

/** ТЗ-7: Сообщения только из шапки (desktop) и нижнего меню (mobile). Не дублируем в сайдбаре. */
const TABS: { id: CabinetTab; label: string; icon: React.ReactNode; mobileOrder?: number }[] = [
  { id: 'home', label: 'Обзор', icon: <HomeIcon />, mobileOrder: 0 },
  { id: 'listings', label: 'Мои объявления', icon: <ListingsIcon />, mobileOrder: 1 },
  { id: 'bookings', label: 'Бронирования', icon: <CalendarIcon /> },
  { id: 'promotion', label: 'Продвижение', icon: <RocketIcon /> },
  { id: 'finances', label: 'Финансы', icon: <WalletIcon /> },
  { id: 'profile', label: 'Профиль', icon: <UserIcon />, mobileOrder: 2 },
  { id: 'settings', label: 'Настройки', icon: <SettingsIcon />, mobileOrder: 3 },
]

function HomeIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function ListingsIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
function WalletIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

/** ТЗ 6: mobile — только 4 таба: Главная, Объявления, Сообщения, Профиль */
export const MOBILE_TABS: CabinetTab[] = ['home', 'listings', 'messages', 'profile']

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

export interface SidebarV2Props {
  activeTab: CabinetTab
  onTabChange: (tab: CabinetTab) => void
  className?: string
  /** ТЗ 14: показывать пункт «Админ» для роли admin */
  showAdmin?: boolean
}

export function SidebarV2({ activeTab, onTabChange, className, showAdmin }: SidebarV2Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const tabsWithAdmin = showAdmin ? [...TABS, { id: 'admin' as CabinetTab, label: 'Админ', icon: <ShieldIcon /> }] : TABS

  return (
    <>
      {/* Mobile: кнопка открытия меню */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-[12px]',
            'bg-[var(--bg-card)] border border-[var(--border-main)]',
            'text-[var(--text-primary)] text-[14px] font-medium',
            'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
          )}
          aria-expanded={mobileOpen}
        >
          {tabsWithAdmin.find((t) => t.id === activeTab)?.label ?? 'Меню'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
        </button>
      </div>

      <aside
        className={cn(
          'rounded-[16px] border border-[var(--border-main)] p-5',
          'bg-[var(--bg-card)]/80 backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
          'sticky top-6',
          'max-h-[calc(100vh-2rem)] overflow-y-auto',
          !mobileOpen && 'hidden lg:block',
          mobileOpen && 'mb-6',
          className
        )}
      >
        <h2 className="text-[16px] font-bold text-[var(--text-primary)] mb-4 px-1">Кабинет</h2>
        <nav className="space-y-0.5">
          {tabsWithAdmin.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-all',
                  isActive && 'bg-[var(--accent)] text-[var(--button-primary-text)] shadow-[0_2px_8px_rgba(124,58,237,0.25)]',
                  !isActive && 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                )}
              >
                {tab.icon}
                <span className="flex-1">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

'use client'

/** TZ-49 + TZ-52: Профиль через дизайн-систему — Container, Section, Card, Button. */

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import {
  FileText,
  Wallet,
  Megaphone,
  Settings,
  ChevronRight,
  CalendarCheck,
  LogOut,
  BarChart3,
  Shield,
  AlertTriangle,
  Users,
  Plus,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Container, Section, Card, Button } from '@/components/ui'

const ICON_CLS = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'
const SECTION_TITLE = 'text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)]'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, hasRole } = useAuthStore()

  const listingUsed = (user as any)?.listingUsed ?? 0
  const isAdmin = hasRole?.('admin') || user?.role === 'admin'
  const isLandlord = !isAdmin && (hasRole?.('landlord') || user?.role === 'landlord' || listingUsed > 0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) router.replace(`/auth/login?redirect=${encodeURIComponent('/profile')}`)
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center section">
          <p className="text-[var(--text-secondary)]">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/profile')}`} className="btn-primary inline-flex items-center justify-center px-5">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const roleLabel = isAdmin ? 'Администратор' : isLandlord ? 'Арендодатель' : 'Пользователь'

  const menuRowCls = 'profile-item flex items-center justify-between gap-3 w-full px-4 rounded-[14px] min-h-[56px] hover:translate-y-[-1px] active:scale-[0.99] transition-all duration-200 text-left card-ds'

  return (
    <div className="bg-[var(--bg-primary)] pb-24 md:pb-8 min-h-screen">
      <Container className="pt-4 flex flex-col gap-4">
        <Card className="flex items-center gap-4 p-4 max-h-[90px] rounded-[var(--border-radius-md)]">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] overflow-hidden shrink-0 flex items-center justify-center text-[18px] font-semibold text-[var(--text-muted)]">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (user?.full_name || user?.username || '?').slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
              {user?.full_name || user?.username || 'Пользователь'}
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{roleLabel}</p>
          </div>
          <Link href="/profile/edit" className="btn-primary inline-flex items-center justify-center px-3 py-2 text-[13px] h-auto min-h-0">
            Редактировать
          </Link>
        </Card>

        <div className="md:hidden w-full">
          <Link href="/profile/listings/create" className="btn-primary w-full inline-flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            Разместить объявление
          </Link>
        </div>

        {isAdmin && (
          <Section>
            <h2 className={SECTION_TITLE}>Администрирование</h2>
            <div className="flex flex-col gap-3">
              <Link href="/admin" className={menuRowCls}>
                <span className="flex items-center gap-3"><Shield className={ICON_CLS} />Админ панель</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=moderation" className={menuRowCls}>
                <span className="flex items-center gap-3"><Shield className={ICON_CLS} />Модерация</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=push" className={menuRowCls}>
                <span className="flex items-center gap-3"><AlertTriangle className={ICON_CLS} />Жалобы</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=users" className={menuRowCls}>
                <span className="flex items-center gap-3"><Users className={ICON_CLS} />Пользователи</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
            </div>
          </Section>
        )}

        <Section>
          <h2 className={SECTION_TITLE}>Профиль</h2>
          <div className="flex flex-col gap-3">
            <Link href="/profile/listings" className={menuRowCls}>
              <span className="flex items-center gap-3"><FileText className={ICON_CLS} />Мои объявления</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/bookings" className={menuRowCls}>
              <span className="flex items-center gap-3"><CalendarCheck className={ICON_CLS} />Бронирования</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/finance" className={menuRowCls}>
              <span className="flex items-center gap-3"><Wallet className={ICON_CLS} />Финансы</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/promo" className={menuRowCls}>
              <span className="flex items-center gap-3"><Megaphone className={ICON_CLS} />Продвижение</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/analytics" className={menuRowCls}>
              <span className="flex items-center gap-3"><BarChart3 className={ICON_CLS} />Аналитика</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/settings" className={menuRowCls}>
              <span className="flex items-center gap-3"><Settings className={ICON_CLS} />Настройки</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              className={cn(menuRowCls, 'text-[var(--text-secondary)] hover:bg-red-500/10')}
              onClick={async () => {
                await logout()
                router.push('/')
              }}
            >
              <span className="flex items-center gap-3"><LogOut className={ICON_CLS} />Выход</span>
            </Button>
          </div>
        </Section>
      </Container>
    </div>
  )
}

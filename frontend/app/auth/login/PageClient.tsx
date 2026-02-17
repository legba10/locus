'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { handleTelegramLogin } from '@/shared/telegram/telegram.bridge'
import Loader from '@/components/lottie/Loader'
import TelegramStatus from '@/components/lottie/TelegramStatus'

/**
 * LoginPage — Страница входа.
 */
export default function PageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error, clearError } = useAuthStore()
  const fromRegistered = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login({ email, password })
      router.push('/')
    } catch (err: any) {
      console.error('Login error', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
      <div className="w-full max-w-md">
            {/* Card — ТЗ №1: только переменные темы */}
            <div className={cn(
              'rounded-[20px] p-8 relative',
              'bg-[var(--bg-card)] border border-[var(--border-main)]',
              'shadow-[var(--shadow-card)]'
            )}>
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-[var(--text-primary)] mb-2">Вход</h1>
              <p className="text-[14px] text-[var(--text-secondary)]">
                Войдите в аккаунт LOCUS
              </p>
              {fromRegistered && (
                <p className="mt-2 text-[13px] text-green-600 font-medium">
                  Аккаунт создан. Войдите с вашим email и паролем.
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px] space-y-1">
                <p className="font-medium">{error}</p>
                {error.includes('не удалось подключиться') && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Проверьте, что backend запущен: <code className="bg-red-100 px-1 rounded">cd backend && npm run start:dev</code>
                  </p>
                )}
                {error.includes('Неверный email или пароль') && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Убедитесь, что вы используете правильный email (например, <code className="bg-red-100 px-1 rounded">host1@locus.local</code>) и пароль <code className="bg-red-100 px-1 rounded">password123</code>
                  </p>
                )}
              </div>
            )}

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3 text-[14px]',
                    'bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]',
                    'transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3 text-[14px]',
                    'bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]',
                    'transition-all'
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 rounded-[14px] flex items-center justify-center gap-2',
                  'bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
                  'hover:bg-violet-500 active:bg-violet-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                  'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader size={22} />
                    Вход...
                  </>
                ) : 'Войти'}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-[13px] text-[var(--text-secondary)]">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-[var(--accent)] hover:opacity-90 font-medium">
                Зарегистрироваться
              </Link>
            </p>

            {/* Тестовые аккаунты — подсказка для разработки */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-[12px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                  Тестовые аккаунты (для разработки)
                </summary>
                <div className="mt-3 p-3 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-main)] text-[11px] text-[var(--text-secondary)] space-y-1.5">
                  <p><strong className="text-[var(--text-primary)]">Пользователь:</strong> guest1@locus.local / password123</p>
                  <p><strong className="text-[var(--text-primary)]">Арендодатель:</strong> host1@locus.local / password123</p>
                  <p><strong className="text-[var(--text-primary)]">Администратор:</strong> admin@locus.local / password123</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    После выполнения <code className="bg-[var(--bg-elevated)] px-1 rounded">npm run db:seed</code> в backend
                  </p>
                </div>
              </details>
            )}

            {/* Telegram Login — показывается если бот настроен */}
            {(process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME) && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-main)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--bg-card)] text-[var(--text-secondary)]">или</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTelegramLogin()}
                  className={cn(
                    'w-full py-3 rounded-[14px]',
                    'bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
                    'hover:opacity-95 active:opacity-90 transition-opacity',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  <TelegramStatus />
                  Войти через Telegram
                </button>
                <p className="text-center text-[12px] text-[var(--text-secondary)]">
                  Хотите <span className="font-medium text-[var(--text-primary)]">сдать жильё бесплатно</span>? После входа вы сможете разместить 1 объявление на FREE.
                </p>
              </>
            )}
          </div>
        </div>

            {/* Back to home */}
            <div className="text-center mt-6">
              <Link href="/" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                ← На главную
              </Link>
            </div>
          </div>
    </div>
  )
}

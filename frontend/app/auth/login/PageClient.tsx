'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { handleTelegramLogin } from '@/shared/telegram/telegram.bridge'

/**
 * LoginPage — Страница входа
 * 
 * Дизайн: glass UI, фиолетовый акцент, плотность UI
 * Telegram login: UI + заглушка логики
 */
export default function PageClient() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()

    try {
      await login({ email, password })
      router.push('/')
    } catch (err: any) {
      // Error is handled by store, but we can add additional logging
      console.error('Login error:', err)
      // Если ошибка связана с сетью или backend недоступен
      if (err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')) {
        // Попробуем показать более понятное сообщение
        // Но основная ошибка уже установлена в store
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="w-full max-w-md">
        {/* Glass Card */}
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px]',
          'rounded-[20px]',
          'border border-white/60',
          'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
          'p-8'
        )}>
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-[#1C1F26] mb-2">Вход</h1>
              <p className="text-[14px] text-[#6B7280]">
                Войдите в аккаунт LOCUS
              </p>
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
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
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                    'transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
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
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                    'transition-all'
                  )}
                />
              </div>

              {/* Submit — фиолетовый */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 rounded-[14px]',
                  'bg-violet-600 text-white font-semibold text-[15px]',
                  'hover:bg-violet-500 active:bg-violet-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                  'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]'
                )}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-[13px] text-[#6B7280]">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-violet-600 hover:text-violet-700 font-medium">
                Зарегистрироваться
              </Link>
            </p>

            {/* Тестовые аккаунты — подсказка для разработки */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-[12px] text-[#6B7280] cursor-pointer hover:text-[#1C1F26] transition-colors">
                  Тестовые аккаунты (для разработки)
                </summary>
                <div className="mt-3 p-3 rounded-[12px] bg-gray-50 border border-gray-200 text-[11px] text-[#6B7280] space-y-1.5">
                  <p><strong className="text-[#1C1F26]">Пользователь:</strong> guest1@locus.local / password123</p>
                  <p><strong className="text-[#1C1F26]">Арендодатель:</strong> host1@locus.local / password123</p>
                  <p><strong className="text-[#1C1F26]">Администратор:</strong> admin@locus.local / password123</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-2">
                    После выполнения <code className="bg-gray-200 px-1 rounded">npm run db:seed</code> в backend
                  </p>
                </div>
              </details>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/[0.75] text-[#6B7280]">или</span>
              </div>
            </div>

            {/* Telegram Login — снизу */}
            <button
              onClick={handleTelegramLogin}
              className={cn(
                'w-full py-3 rounded-[14px]',
                'bg-[#0088cc] text-white font-semibold text-[15px]',
                'hover:bg-[#0077b3] transition-colors',
                'flex items-center justify-center gap-2',
                'shadow-md'
              )}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Войти через Telegram
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-[13px] text-[#6B7280] hover:text-[#1C1F26] transition-colors">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  )
}

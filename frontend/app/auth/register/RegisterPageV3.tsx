'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard, GlassButton, GlassInput } from '@/ui-system/glass'
import { RU } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'

type UserRole = 'guest' | 'host'

interface RoleOption {
  value: UserRole
  label: string
  description: string
  icon: string
}

const ROLES: RoleOption[] = [
  { value: 'guest', label: RU.auth.i_rent, description: 'Найти квартиру для аренды', icon: '🔍' },
  { value: 'host', label: RU.auth.i_own, description: 'Разместить объявление', icon: '🏠' },
]

/**
 * RegisterPageV3 — Регистрация в стиле LOCUS Liquid Glass
 * 
 * Шаги:
 * 1. Выбор роли: "Ищу жильё" / "Сдаю жильё"
 * 2. Форма регистрации
 * 3. Онбординг
 */
export function RegisterPageV3() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form' | 'onboarding'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: selectedRole } },
      })
      if (error) throw new Error(error.message)
      setStep('onboarding')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboarding = (action: 'search' | 'create') => {
    if (action === 'search') {
      router.push('/listings')
    } else {
      router.push('/owner/listings/new')
    }
  }

  // Background wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/15 blur-[80px]" />
      </div>
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LOCUS
            </span>
          </Link>
          <p className="text-white/60 text-sm mt-2">AI для выбора жилья</p>
        </div>
        {children}
        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/50 hover:text-white/70 transition-colors">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  )

  // Step 1: Role selection
  if (step === 'role') {
    return (
      <PageWrapper>
        <GlassCard variant="default" padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">{RU.auth.register}</h1>
              <p className="text-white/60 text-sm mt-1">{RU.auth.who_are_you}</p>
            </div>

            <div className="space-y-3">
              {ROLES.map(role => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl transition-all duration-200',
                    'bg-white/[0.05] backdrop-blur-sm',
                    'border border-white/[0.1]',
                    'hover:bg-white/[0.1] hover:border-purple-500/30',
                    'hover:shadow-lg hover:shadow-purple-500/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <div className="font-medium text-white">{role.label}</div>
                      <div className="text-sm text-white/60">{role.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-white/60">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                {RU.auth.login}
              </Link>
            </p>
          </div>
        </GlassCard>
      </PageWrapper>
    )
  }

  // Step 2: Registration form
  if (step === 'form') {
    const roleOption = ROLES.find(r => r.value === selectedRole)
    
    return (
      <PageWrapper>
        <GlassCard variant="default" padding="lg">
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('role')}
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              ← {RU.common.back}
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{RU.auth.register}</h1>
              <p className="text-sm text-white/60 flex items-center justify-center gap-2 mt-1">
                <span>{roleOption?.icon}</span>
                {roleOption?.label}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput
                label="Имя"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут"
                required
                fullWidth
              />

              <GlassInput
                label={RU.auth.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                fullWidth
              />

              <GlassInput
                label={RU.auth.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                minLength={6}
                required
                fullWidth
              />

              <GlassButton
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                {loading ? 'Создание...' : RU.auth.register}
              </GlassButton>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.1]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-transparent text-white/40">или</span>
              </div>
            </div>

            <p className="text-center text-sm text-white/60">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                {RU.auth.login}
              </Link>
            </p>
          </div>
        </GlassCard>
      </PageWrapper>
    )
  }

  // Step 3: Onboarding
  return (
    <PageWrapper>
      <GlassCard variant="glow" padding="lg">
        <div className="text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Добро пожаловать!</h1>
            <p className="text-white/60 mt-1">Что вы хотите сделать?</p>
          </div>

          <div className="space-y-3">
            <GlassButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => handleOnboarding('search')}
            >
              🔍 Найти жильё
            </GlassButton>
            
            {selectedRole === 'host' && (
              <GlassButton
                variant="glass"
                fullWidth
                size="lg"
                onClick={() => handleOnboarding('create')}
              >
                🏠 Разместить жильё
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </PageWrapper>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { Logo } from '@/shared/ui/Logo'
import { supabase } from '@/shared/supabase-client'
import { CITIES } from '@/shared/data/cities'

type UserRole = 'user' | 'landlord'

interface RoleOption {
  value: UserRole
  label: string
  description: string
  icon: string
}

const ROLES: RoleOption[] = [
  { value: 'user', label: 'Ищу жильё', description: 'Найти квартиру для аренды', icon: '🔍' },
  { value: 'landlord', label: 'Сдаю жильё', description: 'Разместить объявление', icon: '🏠' },
]

/**
 * RegisterPageV4 — Регистрация с 3 шагами
 * 
 * Шаг 1: тип пользователя
 * Шаг 2: данные (имя, email, пароль)
 * Шаг 3: параметры для AI (город, бюджет, тип жилья)
 * 
 * Дизайн: glass UI, фиолетовый акцент, плотность UI
 */
export function RegisterPageV4() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form' | 'ai'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [aiCity, setAiCity] = useState('')
  const [aiBudget, setAiBudget] = useState('')
  const [aiType, setAiType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('form')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    // Переходим к шагу 3 только для user
    if (selectedRole === 'user') {
      setStep('ai')
    } else {
    // Для landlord сразу регистрируем
      await handleRegister()
    }
  }

  const handleRegister = async () => {
    if (!selectedRole) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: selectedRole,
            ai_preferences: selectedRole === 'user' ? { city: aiCity, budget: aiBudget, type: aiType } : undefined,
          },
        },
      })
      if (error) throw new Error(error.message)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleRegister()
  }

  // Glass card wrapper
  const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
      'bg-white/[0.75] backdrop-blur-[22px]',
      'rounded-[20px]',
      'border border-white/60',
      'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
      'p-8',
      className
    )}>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="primary" size="md" />
        </div>

        {/* Шаг 1: Выбор роли */}
        {step === 'role' && (
          <GlassCard>
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-[24px] font-bold text-[#1C1F26] mb-2">Регистрация</h1>
                <p className="text-[14px] text-[#6B7280]">Выберите тип аккаунта</p>
              </div>

              <div className="space-y-3">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className={cn(
                      'w-full text-left p-5 rounded-[16px]',
                      'border-2 border-gray-200',
                      'hover:border-violet-400 hover:bg-violet-50/50',
                      'transition-all duration-200',
                      'bg-white/60 backdrop-blur-sm'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{role.icon}</span>
                      <div>
                        <div className="font-semibold text-[16px] text-[#1C1F26]">{role.label}</div>
                        <div className="text-[13px] text-[#6B7280] mt-0.5">{role.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-[13px] text-[#6B7280]">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </GlassCard>
        )}

        {/* Шаг 2: Форма регистрации */}
        {step === 'form' && (
          <GlassCard>
            <div className="space-y-6">
              <button
                onClick={() => setStep('role')}
                className="text-[13px] text-[#6B7280] hover:text-[#1C1F26] transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="text-center">
                <h1 className="text-[22px] font-bold text-[#1C1F26] mb-1">Создать аккаунт</h1>
                <p className="text-[13px] text-[#6B7280]">
                  {selectedRole === 'user' ? 'Ищу жильё' : 'Сдаю жильё'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px]">
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как вас зовут"
                    required
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
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
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
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    minLength={6}
                    required
                    className={cn(
                      'w-full rounded-[14px] px-4 py-3',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all'
                    )}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                  {loading ? 'Создание...' : 'Продолжить'}
                </button>
              </form>
            </div>
          </GlassCard>
        )}

        {/* Шаг 3: Параметры для AI (только для user) */}
        {step === 'ai' && selectedRole === 'user' && (
          <GlassCard>
            <div className="space-y-6">
              <button
                onClick={() => setStep('form')}
                className="text-[13px] text-[#6B7280] hover:text-[#1C1F26] transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="text-center">
                <h1 className="text-[22px] font-bold text-[#1C1F26] mb-1">Параметры для подбора</h1>
                <p className="text-[13px] text-[#6B7280]">
                  LOCUS будет подбирать жильё под ваши параметры
                </p>
              </div>

              <form onSubmit={handleAiSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Город</label>
                  <select
                    value={aiCity}
                    onChange={(e) => setAiCity(e.target.value)}
                    className={cn(
                      'w-full rounded-[14px] px-4 py-3',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all cursor-pointer'
                    )}
                  >
                    <option value="">Выберите город</option>
                    {CITIES.map((cityOption) => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Бюджет</label>
                  <input
                    type="number"
                    value={aiBudget}
                    onChange={(e) => setAiBudget(e.target.value)}
                    placeholder="до 50000"
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
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Тип жилья</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className={cn(
                      'w-full rounded-[14px] px-4 py-3',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all cursor-pointer'
                    )}
                  >
                    <option value="">Любой</option>
                    <option value="apartment">Квартира</option>
                    <option value="room">Комната</option>
                    <option value="house">Дом</option>
                    <option value="studio">Студия</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                  {loading ? 'Регистрация...' : 'Завершить регистрацию'}
                </button>
              </form>
            </div>
          </GlassCard>
        )}

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

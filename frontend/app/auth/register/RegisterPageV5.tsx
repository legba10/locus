'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { Logo } from '@/shared/ui/Logo'
import { useAuthStore } from '@/domains/auth'
import { CityInput } from '@/shared/components/CityInput'

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
 * RegisterPageV5 — Улучшенная регистрация с 3 шагами
 * 
 * Шаг 1: выбор роли (Ищу жильё / Сдаю жильё)
 * Шаг 2: данные (имя, email, пароль)
 * Шаг 3: подтверждение (для guest - AI параметры, для host - подтверждение)
 */
export function RegisterPageV5() {
  const router = useRouter()
  const { register } = useAuthStore()
  const [step, setStep] = useState<'role' | 'form' | 'confirm'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    // Проверка паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    // Переходим к шагу 3
    setStep('confirm')
  }

  const handleRegister = async () => {
    if (!selectedRole) return

    setLoading(true)
    setError('')

    try {
      await register({
        email,
        password,
        name,
        role: selectedRole,
      })

      // После регистрации переходим на главную
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo variant="primary" size="md" />
          </div>

          {/* Шаг 1: Выбор роли */}
          {step === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-[24px] font-bold text-[#1C1F26] mb-2">Кто вы?</h1>
                <p className="text-[14px] text-[#6B7280]">Выберите тип аккаунта</p>
              </div>

              <div className="space-y-3">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className={cn(
                      'w-full p-4 rounded-[16px]',
                      'border-2 border-gray-200 bg-white',
                      'hover:border-violet-300 hover:bg-violet-50/50',
                      'transition-all text-left',
                      'shadow-sm hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-violet-600">{role.icon}</div>
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
          )}

          {/* Шаг 2: Форма регистрации */}
          {step === 'form' && (
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

                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Подтвердите пароль</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
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
                  className={cn(
                    'w-full py-3 rounded-[14px]',
                    'bg-violet-600 text-white font-semibold text-[15px]',
                    'hover:bg-violet-500 transition-colors',
                    'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
                  )}
                >
                  Продолжить
                </button>
              </form>
            </div>
          )}

          {/* Шаг 3: Подтверждение / AI параметры */}
          {step === 'confirm' && (
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

              {selectedRole === 'user' ? (
                // AI параметры для пользователя
                <>
                  <div className="text-center">
                    <h1 className="text-[22px] font-bold text-[#1C1F26] mb-1">Параметры для AI</h1>
                    <p className="text-[13px] text-[#6B7280]">
                      Помогите AI подобрать вам идеальное жильё
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px]">
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Город</label>
                      <CityInput
                        value={aiCity}
                        onChange={setAiCity}
                        placeholder="Выберите город"
                        className={cn(
                          'w-full rounded-[14px] px-4 py-3',
                          'border border-gray-200/60 bg-white/95',
                          'text-[#1C1F26] text-[14px]',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Бюджет (₽/мес)</label>
                      <input
                        type="number"
                        value={aiBudget}
                        onChange={(e) => setAiBudget(e.target.value)}
                        placeholder="30000"
                        className={cn(
                          'w-full rounded-[14px] px-4 py-3',
                          'border border-gray-200/60 bg-white/95',
                          'text-[#1C1F26] text-[14px]',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
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
                          'border border-white/60',
                          'bg-white/75 backdrop-blur-[18px]',
                          'text-[#1C1F26] text-[14px]',
                          'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                          'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                          'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
                          'transition-all cursor-pointer appearance-none'
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
                        'hover:bg-violet-500 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
                      )}
                    >
                      {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                  </form>
                </>
              ) : (
                // Подтверждение для арендодателя
                <>
                  <div className="text-center">
                    <h1 className="text-[22px] font-bold text-[#1C1F26] mb-1">Подтверждение</h1>
                    <p className="text-[13px] text-[#6B7280]">
                      Проверьте данные перед регистрацией
                    </p>
                  </div>

                  <div className="space-y-3 p-4 bg-gray-50 rounded-[14px]">
                    <div>
                      <span className="text-[12px] text-[#6B7280]">Имя:</span>
                      <p className="text-[14px] font-medium text-[#1C1F26]">{name}</p>
                    </div>
                    <div>
                      <span className="text-[12px] text-[#6B7280]">Email:</span>
                      <p className="text-[14px] font-medium text-[#1C1F26]">{email}</p>
                    </div>
                    <div>
                      <span className="text-[12px] text-[#6B7280]">Тип аккаунта:</span>
                      <p className="text-[14px] font-medium text-[#1C1F26]">
                        {selectedRole === 'landlord' ? 'Арендодатель' : 'Пользователь'}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px]">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className={cn(
                      'w-full py-3 rounded-[14px]',
                      'bg-violet-600 text-white font-semibold text-[15px]',
                      'hover:bg-violet-500 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
                    )}
                  >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                  </button>
                </>
              )}
            </div>
          )}
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

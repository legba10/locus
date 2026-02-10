'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardTitle, Button, Divider } from '@/ui-system'
import { cn } from '@/shared/utils/cn'

type UserRole = 'user' | 'landlord'

interface RoleOption {
  value: UserRole
  label: string
  description: string
  icon: string
}

const ROLES: RoleOption[] = [
  { value: 'user', label: 'Я ищу жильё', description: 'Найти квартиру для аренды', icon: '🔍' },
  { value: 'landlord', label: 'Я сдаю жильё', description: 'Разместить объявление', icon: '🏠' },
]

/**
 * RegisterPageV2 — Auth UX без host/tenant
 * 
 * Заменено:
 * - "host" → "владелец" / "Я сдаю жильё"
 * - "tenant" → "пользователь" / "Я ищу жильё"
 * 
 * ❗ Никаких английских терминов в UI.
 */
export function RegisterPageV2() {
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

  // Step 1: Role selection
  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Регистрация в LOCUS</h1>
            <p className="text-gray-500">Выберите, как вы хотите использовать сервис</p>
          </div>

          <div className="space-y-3">
            {ROLES.map(role => (
              <button
                key={role.value}
                onClick={() => handleRoleSelect(role.value)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition',
                  'hover:border-blue-300 hover:bg-blue-50',
                  'border-gray-200 bg-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <span className="text-gray-500">Уже есть аккаунт? </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Registration form
  if (step === 'form') {
    const roleLabel = ROLES.find(r => r.value === selectedRole)?.label
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card variant="bordered" className="w-full max-w-md">
          <div className="text-center mb-6">
            <button
              onClick={() => setStep('role')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              ← Назад
            </button>
            <h1 className="text-xl font-bold text-gray-900">Создать аккаунт</h1>
            <p className="text-sm text-gray-500">{roleLabel}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Зарегистрироваться
            </Button>
          </form>

          <Divider label="или" />

          <div className="text-center">
            <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Step 3: Onboarding
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать в LOCUS!</h1>
        <p className="text-gray-500 mb-8">Что вы хотите сделать?</p>

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => handleOnboarding('search')}
          >
            🔍 Найти жильё
          </Button>
          
          {selectedRole === 'landlord' && (
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => handleOnboarding('create')}
            >
              🏠 Разместить жильё
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { AiParamsForm, type AiParamsData } from '@/components/ai/AiParamsForm'

const CABINET_PATH = '/owner/dashboard'

export default function AiParamsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useFetch<{ aiParams?: Record<string, unknown> | null }>(
    ['profile'],
    '/api/profile',
    { enabled: isAuthenticated() }
  )
  const [isSaving, setIsSaving] = useState(false)

  // ТЗ №8: если уже проходил шаг (заполнил или пропустил) — в кабинет
  useEffect(() => {
    if (!isAuthenticated() || profileLoading) return
    const completed = profile?.aiParams != null
    if (completed) {
      router.replace(CABINET_PATH)
    }
  }, [isAuthenticated, profileLoading, profile?.aiParams, router])

  const handleSave = async (data: AiParamsData) => {
    setIsSaving(true)
    try {
      await apiFetchJson('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          ai_params: {
            budget: data.budget,
            rooms: data.rooms,
            district: data.district || undefined,
            duration: data.duration,
            propertyType: data.propertyType,
          },
        }),
      })
      router.push(CABINET_PATH)
    } catch (e) {
      console.error(e)
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    setIsSaving(true)
    try {
      await apiFetchJson('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ ai_params: { skipped: true } }),
      })
      router.push(CABINET_PATH)
    } catch {
      router.push(CABINET_PATH)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[14px] text-[var(--accent)] hover:underline">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" aria-hidden />
      </div>
    )
  }

  const completed = profile?.aiParams != null
  if (completed) {
    return null
  }

  const initial = profile?.aiParams as Partial<AiParamsData> | undefined

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div
          className="rounded-[20px] p-4 sm:p-6 border border-[var(--border-main)] bg-[var(--bg-card)]"
        >
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-2">
            Поможем AI подобрать жильё
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mb-6">
            Укажите предпочтения — подбор станет точнее
          </p>
          <AiParamsForm
            initialValues={initial}
            onSave={handleSave}
            onSkip={handleSkip}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  )
}

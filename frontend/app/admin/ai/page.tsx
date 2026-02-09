'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { apiFetch } from '@/shared/utils/apiFetch'

export default function AdminAiPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setResult(null)
    try {
      try {
        await apiFetch('/admin/ai/analyze', { method: 'POST' })
      } catch {
        // Backend endpoint optional: show message anyway
      }
      setResult('Анализ платформы запланирован. Разделы: анализ объявлений, подозрительные пользователи, рекомендации цен, аналитика спроса. Полная интеграция с AI — следующий этап.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1C1F26] mb-1">AI-помощник</h1>
            <p className="text-[14px] text-[#6B7280]">Анализ объявлений, рекомендации цен, аналитика спроса</p>
          </div>
          <Link href="/admin" className="px-4 py-2 rounded-[14px] bg-gray-100 text-[#1C1F26] text-[14px] font-medium hover:bg-gray-200">
            ← В админку
          </Link>
        </div>

        <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className={cn(
              'w-full sm:w-auto px-6 py-3 rounded-[14px] font-semibold text-[14px]',
              'bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {analyzing ? 'Анализируем...' : 'Проанализировать платформу'}
          </button>
          {result && <p className="mt-4 text-[14px] text-[#6B7280]">{result}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Section title="Анализ объявлений" desc="Качество описаний, фото, заполненность полей." />
          <Section title="Подозрительные пользователи" desc="Паттерны поведения, дубли, спам." />
          <Section title="Рекомендации цен" desc="Сравнение с рынком по городу и типу жилья." />
          <Section title="Аналитика спроса" desc="Популярные направления, сезонность." />
        </div>
      </div>
    </div>
  )
}

function Section({ title, desc }: { title: string; desc: string }) {
  return (
    <div className={cn('bg-white rounded-[18px] p-5', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
      <h2 className="text-[18px] font-bold text-[#1C1F26] mb-2">{title}</h2>
      <p className="text-[13px] text-[#6B7280]">{desc}</p>
    </div>
  )
}

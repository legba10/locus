'use client'

import { useState, useMemo } from 'react'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { METRICS_POOL, type ReviewMetricDefinition } from '@/shared/reviews/metricsPool'

const STEPS = 4
const METRICS_TO_SHOW = 6

export function ReviewFormStepByStep({
  listingId,
  onSubmitted,
}: {
  listingId: string
  onSubmitted?: () => void
}) {
  const metricsDefs = useMemo<ReviewMetricDefinition[]>(() => {
    const shuffled = [...METRICS_POOL]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, METRICS_TO_SHOW)
  }, [])

  const [step, setStep] = useState(1)
  const [rating, setRating] = useState(5)
  const [metricIndex, setMetricIndex] = useState(0)
  const [metrics, setMetrics] = useState<Record<string, number>>(
    Object.fromEntries(metricsDefs.map((m) => [m.key, 75]))
  )
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const currentMetric = metricsDefs[metricIndex]
  const isLastMetric = metricIndex >= metricsDefs.length - 1

  const handleNextMetric = (value: number) => {
    if (currentMetric) setMetrics((prev) => ({ ...prev, [currentMetric.key]: value }))
    if (isLastMetric) setStep(3)
    else setMetricIndex((i) => i + 1)
  }

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await apiFetchJson('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listingId,
          rating,
          text: text.trim() || null,
          metrics: Object.entries(metrics).map(([metricKey, value]) => ({ metricKey, value })),
        }),
      })
      setSuccess(true)
      onSubmitted?.()
    } catch (e: any) {
      setError(e?.code === 'REVIEW_ALREADY_EXISTS' ? 'Вы уже оставили отзыв.' : (e?.message ?? 'Ошибка отправки'))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-[16px] font-semibold text-emerald-800">Спасибо! Ваш отзыв опубликован.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[18px] border border-gray-100/80 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      <h3 className="text-[18px] font-bold text-[#1C1F26]">Оставить отзыв</h3>

      {step === 1 && (
        <div className="mt-5">
          <p className="text-[13px] font-semibold text-[#1C1F26] mb-2">Шаг 1. Оценка</p>
          <p className="text-[13px] text-[#6B7280] mb-3">Выберите оценку от 1 до 5</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setRating(v)
                  setStep(2)
                }}
                className={cn(
                  'px-5 py-2.5 rounded-[12px] border text-[15px] font-semibold transition-colors',
                  rating === v
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-[#6B7280] hover:bg-gray-50'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 px-4 py-2 rounded-[12px] bg-violet-600 text-white text-[14px] font-semibold"
          >
            Дальше
          </button>
        </div>
      )}

      {step === 2 && currentMetric && (
        <div className="mt-5">
          <p className="text-[13px] text-[#6B7280] mb-1">
            Шаг 2. Метрики ({metricIndex + 1} из {metricsDefs.length})
          </p>
          <p className="text-[15px] font-semibold text-[#1C1F26] mb-1">{currentMetric.label}</p>
          <p className="text-[13px] text-[#6B7280] mb-4">{currentMetric.hint}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[0, 25, 50, 75, 100].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleNextMetric(v)}
                className={cn(
                  'px-4 py-2 rounded-[12px] border text-[14px] font-medium transition-colors',
                  metrics[currentMetric.key] === v
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (metricIndex === 0 ? setStep(1) : setMetricIndex((i) => i - 1))}
              className="px-4 py-2 rounded-[12px] border border-gray-200 text-[14px]"
            >
              Назад
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-5">
          <p className="text-[13px] font-semibold text-[#1C1F26] mb-2">Шаг 3. Комментарий (необязательно)</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Коротко: что понравилось / что улучшить"
            className="w-full rounded-[12px] px-4 py-3 border border-gray-200 text-[14px]"
          />
          {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-[12px] border border-gray-200 text-[14px]"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 rounded-[12px] bg-violet-600 text-white text-[14px] font-semibold disabled:opacity-50"
            >
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

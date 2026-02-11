'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { pickRandomMetrics, REVIEW_METRICS_COUNT, type ReviewMetricDefinition } from '@/shared/reviews/metricsPool'

const LottiePlayer = dynamic(() => import('lottie-react').then((m) => m.default), { ssr: false })

const STORAGE_KEY = (listingId: string) => `review_draft_${listingId}`

function useLowPerf(): boolean {
  const [low, setLow] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cores = navigator.hardwareConcurrency ?? 4
    setLow(reduced || cores < 2)
  }, [])
  return low
}

function vibrate(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
}

export function ReviewWizard({
  listingId,
  onSubmitted,
  userAlreadyReviewed = false,
  ownerId,
}: {
  listingId: string
  onSubmitted?: () => void
  userAlreadyReviewed?: boolean
  ownerId?: string
}) {
  const lowPerf = useLowPerf()
  const metricsDefs = useMemo<ReviewMetricDefinition[]>(
    () => pickRandomMetrics(REVIEW_METRICS_COUNT),
    []
  )

  const [step, setStep] = useState(1)
  const [stars, setStars] = useState(5)
  const [metricIndex, setMetricIndex] = useState(0)
  const [metrics, setMetrics] = useState<Record<string, number>>(() =>
    Object.fromEntries(metricsDefs.map((m) => [m.key, 75]))
  )
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submittedPercent, setSubmittedPercent] = useState<number | null>(null)
  const [submittedStars, setSubmittedStars] = useState<number | null>(null)
  const [robotData, setRobotData] = useState<object | null>(null)

  useEffect(() => {
    fetch('/lottie/robot.json')
      .then((r) => r.json())
      .then(setRobotData)
      .catch(() => setRobotData(null))
  }, [])

  const currentMetric = metricsDefs[metricIndex]
  const isLastMetric = metricIndex >= metricsDefs.length - 1

  const saveDraft = useCallback(() => {
    try {
      const payload = { step, stars, metrics, comment }
      localStorage.setItem(STORAGE_KEY(listingId), JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [listingId, step, stars, metrics, comment])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(listingId))
      if (!raw) return
      const draft = JSON.parse(raw) as { step?: number; stars?: number; metrics?: Record<string, number>; comment?: string }
      if (draft.step != null && draft.step >= 1 && draft.step <= 3) setStep(draft.step)
      if (draft.stars != null && draft.stars >= 1 && draft.stars <= 5) setStars(draft.stars)
      if (draft.metrics && typeof draft.metrics === 'object') {
        setMetrics((prev) => ({ ...prev, ...draft.metrics }))
      }
      if (typeof draft.comment === 'string') setComment(draft.comment)
    } catch {
      // ignore
    }
  }, [listingId])

  useEffect(() => {
    saveDraft()
    return () => { saveDraft() }
  }, [saveDraft])

  const handleNextMetric = (value: number) => {
    vibrate()
    if (currentMetric) setMetrics((prev) => ({ ...prev, [currentMetric.key]: value }))
    if (isLastMetric) setStep(3)
    else setMetricIndex((i) => i + 1)
  }

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const vals = Object.values(metrics)
      const avgPercent = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
      const rating5 = Math.max(1, Math.min(5, Math.round((avgPercent / 100) * 5) || 1))
      const res = await apiFetchJson<{ ok: boolean; reviewId?: string; summary?: { avg?: number; count?: number; distribution?: Record<number, number> } }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listingId,
          rating: rating5,
          text: comment.trim() || null,
          metrics: Object.entries(metrics).map(([metricKey, value]) => ({ metricKey, value })),
        }),
      })
      setSubmittedPercent(avgPercent)
      setSubmittedStars(rating5)
      setSuccess(true)
      try {
        localStorage.removeItem(STORAGE_KEY(listingId))
      } catch {
        // ignore
      }
      onSubmitted?.()
    } catch (e: any) {
      setError(
        e?.code === 'REVIEW_ALREADY_EXISTS'
          ? 'Вы уже оставили отзыв за этот listing сегодня.'
          : e?.message ?? 'Ошибка отправки'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (userAlreadyReviewed && !success) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-[15px] font-medium text-[#6B7280]">Вы уже оставили отзыв на это объявление.</p>
      </div>
    )
  }

  if (success) {
    const avg = submittedStars ?? 0
    const pct = submittedPercent ?? 0
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
        <p className="text-[16px] font-semibold text-emerald-800 mb-1">Спасибо! Ваш отзыв опубликован.</p>
        <p className="text-[15px] text-emerald-700 mb-4">
          Ваш рейтинг: <strong>{pct}%</strong> → <strong>{avg.toFixed(1)}</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/listings/${listingId}`}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
          >
            Вернуться к объявлению
          </Link>
          {ownerId && (
            <Link
              href={`/user/${ownerId}`}
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-[14px] border border-gray-300 bg-white text-[14px] font-medium text-[#1C1F26] hover:bg-gray-50"
            >
              Профиль владельца
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative mx-auto max-w-[600px] rounded-2xl border border-gray-100/80 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'md:p-6'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-bold text-[#1C1F26]">Оставить отзыв</h3>
        <span className="text-[13px] text-[#6B7280] tabular-nums">Шаг {step} / 3</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {!lowPerf && step <= 2 && robotData && (
        <div className="absolute top-4 right-4 w-14 h-14 pointer-events-none opacity-80">
          <LottiePlayer animationData={robotData} loop style={{ width: 56, height: 56 }} />
        </div>
      )}

      {step === 1 && (
        <div className="relative">
          <p className="text-[13px] text-[#6B7280] mb-3">Выберите оценку от 1 до 5 звёзд</p>
          <div className="flex gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  vibrate()
                  setStars(v)
                }}
                className={cn(
                  'min-h-[44px] min-w-[44px] rounded-xl border-2 text-[20px] transition-all',
                  stars >= v
                    ? 'border-amber-300 bg-amber-50 text-amber-600 scale-105'
                    : 'border-gray-200 bg-white text-gray-300 hover:border-amber-200 hover:text-amber-400'
                )}
                aria-label={`${v} звезд`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] px-6 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              Дальше
            </button>
          </div>
        </div>
      )}

      {step === 2 && currentMetric && (
        <div className="relative">
          <p className="text-[13px] text-[#6B7280] mb-1">
            Метрики ({metricIndex + 1} из {metricsDefs.length})
          </p>
          <p className="text-[15px] font-semibold text-[#1C1F26] mb-1">{currentMetric.label}</p>
          <p className="text-[13px] text-[#6B7280] mb-4">{currentMetric.hint}</p>
          <div className="mb-5">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={metrics[currentMetric.key] ?? 75}
              onChange={(e) => {
                const v = Number(e.target.value)
                vibrate()
                setMetrics((prev) => ({ ...prev, [currentMetric.key]: v }))
              }}
              className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-violet-600"
            />
            <div className="flex justify-between text-[12px] text-[#6B7280] mt-1">
              <span>0</span>
              <span className="font-medium text-violet-600">{metrics[currentMetric.key] ?? 75}%</span>
              <span>100</span>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => (metricIndex === 0 ? setStep(1) : setMetricIndex((i) => i - 1))}
              className="min-h-[44px] flex-1 rounded-[14px] border border-gray-200 bg-white text-[14px] font-medium text-[#1C1F26] hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => (isLastMetric ? setStep(3) : setMetricIndex((i) => i + 1))}
              className="min-h-[44px] flex-1 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              {isLastMetric ? 'Дальше' : 'Далее'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="relative">
          <p className="text-[13px] font-semibold text-[#1C1F26] mb-2">Комментарий (необязательно)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Что понравилось / что улучшить"
            className="w-full rounded-[14px] px-4 py-3 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
          {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] flex-1 rounded-[14px] border border-gray-200 bg-white text-[14px] font-medium hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="min-h-[44px] flex-1 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500 disabled:opacity-50"
            >
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

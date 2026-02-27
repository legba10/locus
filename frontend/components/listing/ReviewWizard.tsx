'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { getShuffledQuestionMetrics, getQuestionPhrase, type ReviewMetricDefinition } from '@/shared/reviews/metricsPool'
import { incrementReviewSubmittedCount, getReviewSubmittedCount } from '@/shared/reviews/reviewReminderStorage'
import { Frown, Meh, Smile, Star } from 'lucide-react'

const STORAGE_KEY = (listingId: string) => `review_draft_${listingId}`
const TOTAL_STEPS = 5

export type EmotionValue = 'positive' | 'neutral' | 'negative'

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
  const metricsDefs = useMemo<ReviewMetricDefinition[]>(() => getShuffledQuestionMetrics(), [])

  const [step, setStep] = useState(1)
  const [stars, setStars] = useState(5)
  const [metricIndex, setMetricIndex] = useState(0)
  const [metrics, setMetrics] = useState<Record<string, number>>(() =>
    Object.fromEntries(metricsDefs.map((m) => [m.key, 75]))
  )
  const [emotion, setEmotion] = useState<EmotionValue | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submittedPercent, setSubmittedPercent] = useState<number | null>(null)
  const [submittedStars, setSubmittedStars] = useState<number | null>(null)

  const currentMetric = metricsDefs[metricIndex]
  const isLastMetric = metricIndex >= metricsDefs.length - 1

  const saveDraft = useCallback(() => {
    try {
      const payload = { step, stars, metrics, emotion, comment }
      localStorage.setItem(STORAGE_KEY(listingId), JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [listingId, step, stars, metrics, emotion, comment])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(listingId))
      if (!raw) return
      const draft = JSON.parse(raw) as {
        step?: number
        stars?: number
        metrics?: Record<string, number>
        emotion?: EmotionValue
        comment?: string
      }
      if (draft.step != null && draft.step >= 1 && draft.step <= TOTAL_STEPS) setStep(draft.step)
      if (draft.stars != null && draft.stars >= 1 && draft.stars <= 5) setStars(draft.stars)
      if (draft.metrics && typeof draft.metrics === 'object') {
        setMetrics((prev) => ({ ...prev, ...draft.metrics }))
      }
      if (draft.emotion && ['positive', 'neutral', 'negative'].includes(draft.emotion)) setEmotion(draft.emotion as EmotionValue)
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
      const tags: string[] = emotion ? [emotion] : []
      const res = await apiFetchJson<{ ok: boolean; reviewId?: string; summary?: { avg?: number; count?: number; distribution?: Record<number, number> } }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listingId,
          rating: rating5,
          text: comment.trim() || null,
          metrics: Object.entries(metrics).map(([metricKey, value]) => ({ metricKey, value })),
          tags,
        }),
      })
      setSubmittedPercent(avgPercent)
      setSubmittedStars(rating5)
      incrementReviewSubmittedCount()
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
    const helpedCount = getReviewSubmittedCount()
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
        <p className="text-[16px] font-semibold text-emerald-800 mb-1">Спасибо! Отзыв помогает другим.</p>
        <p className="text-[15px] text-emerald-700 mb-1">
          Ваш рейтинг: <strong>{pct}%</strong> → <strong>{avg.toFixed(1)}</strong>
        </p>
        <p className="text-[14px] font-medium text-emerald-700 mb-1">+5 к рейтингу пользователя</p>
        {helpedCount > 0 && (
          <p className="text-[13px] text-emerald-600 mb-4">
            Вы помогли {helpedCount} {helpedCount === 1 ? 'человеку' : 'людям'} выбрать жильё.
          </p>
        )}
        {helpedCount === 0 && <div className="mb-4" />}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/listing/${listingId}`}
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
        <span className="text-[13px] text-[#6B7280] tabular-nums">Шаг {step} / {TOTAL_STEPS}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

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
                <Star size={20} />
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
            Вопросы ({metricIndex + 1} из {metricsDefs.length})
          </p>
          <p className="text-[15px] font-semibold text-[#1C1F26] mb-1">{getQuestionPhrase(currentMetric.key)}</p>
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
          <p className="text-[15px] font-semibold text-[#1C1F26] mb-3">Как общее впечатление?</p>
          <div className="flex gap-4 justify-center mb-6">
            {(
              [
                { value: 'positive' as EmotionValue, icon: Smile, label: 'Отлично' },
                { value: 'neutral' as EmotionValue, icon: Meh, label: 'Нормально' },
                { value: 'negative' as EmotionValue, icon: Frown, label: 'Плохо' },
              ] as const
            ).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  vibrate()
                  setEmotion(value)
                }}
                className={cn(
                  'flex flex-col items-center gap-1 min-h-[80px] px-6 rounded-[14px] border-2 transition-all',
                  emotion === value
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-[#6B7280] hover:border-violet-200'
                )}
              >
                <Icon size={24} />
                <span className="text-[13px] font-medium">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] flex-1 rounded-[14px] border border-gray-200 bg-white text-[14px] font-medium hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="min-h-[44px] flex-1 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              Дальше
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="relative">
          <p className="text-[13px] font-semibold text-[#1C1F26] mb-2">Комментарий (необязательно)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Что понравилось / что улучшить"
            className="w-full rounded-[14px] px-4 py-3 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-[44px] flex-1 rounded-[14px] border border-gray-200 bg-white text-[14px] font-medium hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="min-h-[44px] flex-1 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              Дальше
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="relative">
          <p className="text-[15px] font-semibold text-[#1C1F26] mb-3">Подтверждение</p>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4 text-[14px] text-[#4B5563] space-y-1">
            <p>
              Оценка: <strong className="text-amber-600 inline-flex items-center gap-1">{stars} <Star size={14} /></strong>
            </p>
            <p>Впечатление: {emotion === 'positive' ? 'Отлично' : emotion === 'neutral' ? 'Нормально' : emotion === 'negative' ? 'Плохо' : '—'}</p>
            {comment.trim() && <p>Комментарий: «{comment.trim().slice(0, 80)}{comment.trim().length > 80 ? '…' : ''}»</p>}
          </div>
          {error && <p className="mb-2 text-[13px] text-red-600">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setStep(4)}
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

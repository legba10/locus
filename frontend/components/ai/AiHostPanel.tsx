'use client'

import { useEffect, useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { analyzeListing, improveDescription, suggestPrice, type HostListingInput } from '@/lib/ai/hostAnalyzer'
import { useAiHostStore } from '@/core/aiHost/aiHostStore'

type HostTab = 'analysis' | 'recommendations' | 'text' | 'price'

interface AiHostPanelProps {
  open: boolean
  onClose: () => void
  listing: HostListingInput
  isAdmin?: boolean
  onApplyDescription?: (nextText: string) => void
}

export function AiHostPanel({ open, onClose, listing, isAdmin = false, onApplyDescription }: AiHostPanelProps) {
  const [tab, setTab] = useState<HostTab>('analysis')
  const {
    analysisByListing,
    priceByListing,
    improvedTextByListing,
    selectedTipsByListing,
    setListingData,
    toggleTip,
  } = useAiHostStore()

  const listingId = listing.id
  const analysis = analysisByListing[listingId]
  const price = priceByListing[listingId]
  const improvedText = improvedTextByListing[listingId]
  const selectedTips = selectedTipsByListing[listingId] ?? []

  useEffect(() => {
    if (!open) return
    const nextAnalysis = analyzeListing(listing)
    const nextPrice = suggestPrice(listing)
    const nextText = improveDescription(listing)
    setListingData(listing.id, { analysis: nextAnalysis, price: nextPrice, improvedText: nextText })
  }, [
    open,
    listing.id,
    listing.title,
    listing.description,
    listing.photosCount,
    listing.price,
    listing.city,
    listing.district,
    listing.floor,
    listing.metroDistanceMin,
    listing.amenities,
    setListingData,
  ])

  const tabs: Array<{ key: HostTab; label: string }> = [
    { key: 'analysis', label: 'Анализ объявления' },
    { key: 'recommendations', label: 'Рекомендации' },
    { key: 'text', label: 'Улучшение текста' },
    { key: 'price', label: 'Подсказки по цене' },
  ]

  return (
    <Drawer open={open} onClose={onClose} side="right" width={460}>
      <div className="h-full flex flex-col bg-[var(--bg-card)]">
        <div className="p-4 border-b border-[var(--border-main)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">AI-помощник</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                {isAdmin ? 'Режим администратора' : 'Режим владельца'} • mock
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-[10px] border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
              aria-label="Закрыть AI-помощник"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`h-9 rounded-[10px] text-[12px] font-medium ${
                  tab === t.key ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'analysis' && analysis && (
            <>
              <div className="rounded-[14px] border border-[var(--border-main)] bg-[var(--bg-input)] p-4">
                <p className="text-[13px] text-[var(--text-secondary)]">Общая оценка</p>
                <p className="text-[28px] font-semibold text-[var(--text-primary)] mt-1">{analysis.score} / 100</p>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">Заполненность: {analysis.completeness}%</p>
              </div>
              <div className="space-y-2">
                {analysis.checks.map((check) => (
                  <div key={`${check.kind}-${check.text}`} className="rounded-[12px] border border-[var(--border-main)] p-3 bg-[var(--bg-card)]">
                    <p className={`text-[13px] ${check.kind === 'good' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {check.kind === 'good' ? '✔ ' : '⚠ '}
                      {check.text}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'recommendations' && analysis && (
            <div className="space-y-2">
              {analysis.recommendations.map((tip) => {
                const selected = selectedTips.includes(tip)
                return (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => toggleTip(listingId, tip)}
                    className={`w-full text-left rounded-[12px] border p-3 ${
                      selected ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border-main)] bg-[var(--bg-card)]'
                    }`}
                  >
                    <p className="text-[13px] text-[var(--text-primary)]">{tip}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">{selected ? 'Выбрано' : 'Нажмите, чтобы отметить'}</p>
                  </button>
                )
              })}
            </div>
          )}

          {tab === 'text' && (
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3">
                <p className="text-[12px] font-medium text-[var(--text-secondary)]">Ваше описание</p>
                <p className="text-[13px] text-[var(--text-primary)] mt-2 whitespace-pre-wrap">
                  {(listing.description ?? '').trim() || 'Описание пока не заполнено.'}
                </p>
              </div>
              <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
                <p className="text-[12px] font-medium text-[var(--text-secondary)]">Рекомендуемая версия</p>
                <p className="text-[13px] text-[var(--text-primary)] mt-2 whitespace-pre-wrap">{improvedText || ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!improvedText) return
                    if (onApplyDescription) {
                      onApplyDescription(improvedText)
                      return
                    }
                    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                      try {
                        await navigator.clipboard.writeText(improvedText)
                      } catch {
                        // ignore clipboard errors in mock mode
                      }
                    }
                  }}
                  className="h-10 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold"
                >
                  Применить
                </button>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px] font-medium"
                >
                  Оставить как есть
                </button>
              </div>
            </div>
          )}

          {tab === 'price' && price && (
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[var(--border-main)] p-3 bg-[var(--bg-card)]">
                <p className="text-[13px] text-[var(--text-secondary)]">Средняя цена по району</p>
                <p className="text-[22px] font-semibold text-[var(--text-primary)] mt-1">{price.averageDistrictPrice.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="rounded-[12px] border border-[var(--border-main)] p-3 bg-[var(--bg-input)]">
                <p className="text-[13px] text-[var(--text-secondary)]">Рекомендуемая цена</p>
                <p className="text-[22px] font-semibold text-[var(--text-primary)] mt-1">{price.recommendedPrice.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="rounded-[12px] border border-[var(--border-main)] p-3 bg-[var(--bg-card)]">
                <p className="text-[12px] font-medium text-[var(--text-secondary)] mb-2">Почему</p>
                <ul className="space-y-1 text-[13px] text-[var(--text-primary)]">
                  {price.reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

export type { AiHostPanelProps }

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { StepType } from '@/domains/listings/steps/StepType'
import { StepDescription } from '@/domains/listings/steps/StepDescription'
import { StepAmenities } from '@/domains/listings/steps/StepAmenities'
import { StepPrice } from '@/domains/listings/steps/StepPrice'
import { AddressStep } from './steps/AddressStep'
import { PhotosStep } from './steps/PhotosStep'
import { ReviewStep } from './steps/ReviewStep'
import { PublishStep } from './steps/PublishStep'
import { AiListingPanel } from '@/components/ai/AiListingPanel'
import { buildAiDescription } from './aiDescription'
import { addFilesToPhotos, buildPhotoMetaForHouseRules, removePhoto, setPhotoCover, setPhotoType } from './photoController'
import { useListingWizardStore } from './listingStore'
import { useAiController } from '@/ai/aiController'

const STEP_TITLES = [
  'Тип жилья',
  'Адрес и карта',
  'Фото',
  'Описание',
  'Удобства',
  'Цена',
  'Проверка',
  'Публикация',
] as const

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  studio: 'Студия',
  house: 'Дом',
  room: 'Комната',
  apartment_suite: 'Апартаменты',
}

interface ListingWizardProps {
  onSuccess?: (listingId?: string) => void
  onCancel?: () => void
  initialListing?: any | null
  onLimitReached?: () => void
}

export function ListingWizard({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: ListingWizardProps) {
  const queryClient = useQueryClient()
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    type,
    rentMode,
    city,
    district,
    street,
    building,
    lat,
    lng,
    photos,
    title,
    description,
    amenityKeys,
    price,
    deposit,
    commission,
    utilities,
    listingId,
    setField,
    setPhotos,
    reset,
    hydrateFromListing,
  } = useListingWizardStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [removedExistingPhotoIds, setRemovedExistingPhotoIds] = useState<string[]>([])
  const aiController = useAiController()

  const isEdit = Boolean(initialListing?.id)
  const totalSteps = 8

  useEffect(() => {
    if (initialListing?.id) {
      hydrateFromListing(initialListing)
      setRemovedExistingPhotoIds([])
      return
    }
    if (!initialListing) reset()
  }, [initialListing, hydrateFromListing, reset])

  const canNext = useMemo(() => {
    if (step === 1) return city.trim().length > 0
    if (step === 2) return photos.length > 0
    if (step === 3) return title.trim().length > 0
    if (step === 5) return Number(price) > 0
    return true
  }, [step, city, photos.length, title, price])

  const onGenerateDescription = () => {
    const generated = buildAiDescription({
      city,
      district,
      street,
      typeLabel: TYPE_LABELS[type] ?? 'Жилье',
      amenities: amenityKeys,
      price,
      photosCount: photos.length,
    })
    setAiPreview(
      [`Краткое описание:\n${generated.short}`, `\nПродающее:\n${generated.sales}`, `\nПреимущества:\n${generated.advantages}`].join(
        '\n'
      )
    )
  }

  const validateBeforePublish = (): string | null => {
    if (!city.trim()) return 'Укажите город'
    if (!title.trim()) return 'Укажите заголовок'
    if (!description.trim()) return 'Добавьте описание'
    if (!Number(price)) return 'Укажите цену'
    if (photos.length === 0) return 'Добавьте минимум одно фото'
    return null
  }

  const submit = async () => {
    const validationError = validateBeforePublish()
    if (validationError) {
      setError(validationError)
      return
    }
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      const addressLine = [district, street, building].filter(Boolean).join(', ')
      const payload = {
        title: title.trim(),
        description: description.trim(),
        city: city.trim(),
        addressLine: addressLine || undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        basePrice: Number(price),
        currency: 'RUB',
        capacityGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        type: (type === 'apartment_suite' ? 'apartment' : type).toUpperCase(),
        houseRules: {
          deposit: deposit.trim() ? Number(deposit) : undefined,
          type,
          photoMeta: buildPhotoMetaForHouseRules(photos),
        },
        amenityKeys,
      }

      let id = listingId ?? initialListing?.id
      if (id) {
        await apiFetchJson(`/listings/${encodeURIComponent(String(id))}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        const created = await apiFetchJson<any>('/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        id = created?.listing?.id ?? created?.item?.id ?? created?.id ?? null
        if (!id) throw new Error('Сервер не вернул ID объявления')
        setField('listingId', id)
      }

      for (const photoId of removedExistingPhotoIds) {
        await apiFetch(`/listings/${encodeURIComponent(String(id))}/photos/${encodeURIComponent(photoId)}`, {
          method: 'DELETE',
        })
      }

      const existingIds = new Set(
        photos.filter((p) => !p.isNew).map((p) => p.id)
      )
      const newPhotos = photos.filter((p) => p.isNew && p.file)

      for (let i = 0; i < newPhotos.length; i++) {
        const p = newPhotos[i]
        if (!p.file) continue
        const form = new FormData()
        form.append('file', p.file)
        form.append('sortOrder', String(i))
        await apiFetch(`/listings/${encodeURIComponent(String(id))}/photos`, { method: 'POST', body: form })
      }

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i]
        if (!p.isNew && existingIds.has(p.id)) {
          await apiFetch(`/listings/${encodeURIComponent(String(id))}/photos/${encodeURIComponent(p.id)}/order`, {
            method: 'PATCH',
            body: JSON.stringify({ sortOrder: i }),
          })
        }
      }

      if (!isEdit) {
        await apiFetch(`/listings/${encodeURIComponent(String(id))}/publish`, { method: 'POST' })
      }

      try {
        await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
      } catch {}

      reset()
      onSuccess?.(id)
    } catch (e: any) {
      if (e?.code === 'LIMIT_REACHED') {
        onLimitReached?.()
      }
      setError(e?.message ?? 'Ошибка публикации объявления')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStep = step + 1
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="min-h-[100dvh] max-w-[680px] w-full mx-auto p-4 pb-24 flex flex-col gap-[20px]">
      <div className="space-y-1">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
          {isEdit ? 'Редактировать объявление' : 'Новое объявление'}
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Шаг {currentStep} из {totalSteps}: {STEP_TITLES[step]}
        </p>
      </div>

      <div className="h-2 w-full rounded-full bg-[var(--bg-input)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="w-full rounded-[16px] card-tz47 p-[18px] flex flex-col gap-[12px]">
        {step === 0 && (
          <StepType
            type={type}
            rentMode={rentMode}
            onTypeChange={(v) => setField('type', v)}
            onRentModeChange={(v) => setField('rentMode', v)}
          />
        )}
        {step === 1 && (
          <AddressStep
            city={city}
            district={district}
            street={street}
            building={building}
            onCityChange={(v) => setField('city', v)}
            onDistrictChange={(v) => setField('district', v)}
            onStreetChange={(v) => setField('street', v)}
            onBuildingChange={(v) => setField('building', v)}
          />
        )}
        {step === 2 && (
          <PhotosStep
            photos={photos}
            onAddFiles={(files) => setPhotos(addFilesToPhotos(photos, files))}
            onSetType={(id, type) => setPhotos(setPhotoType(photos, id, type))}
            onSetCover={(id) => setPhotos(setPhotoCover(photos, id))}
            onRemove={(id) => {
              const target = photos.find((p) => p.id === id)
              if (target && !target.isNew) {
                setRemovedExistingPhotoIds((prev) => [...prev, id])
              }
              setPhotos(removePhoto(photos, id))
            }}
          />
        )}
        {step === 3 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => aiController.openPanel('listing')}
              className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 text-[13px] font-medium text-[var(--text-primary)]"
            >
              Улучшить объявление AI
            </button>
            <StepDescription
              title={title}
              description={description}
              onTitleChange={(v) => setField('title', v)}
              onDescriptionChange={(v) => setField('description', v)}
              onGenerateDescription={onGenerateDescription}
            />
          </div>
        )}
        {step === 4 && (
          <StepAmenities amenityKeys={amenityKeys} onChange={(keys) => setField('amenityKeys', keys)} />
        )}
        {step === 5 && (
          <StepPrice
            rentMode={rentMode}
            price={price}
            deposit={deposit}
            commission={commission}
            utilities={utilities}
            onPriceChange={(v) => setField('price', v)}
            onDepositChange={(v) => setField('deposit', v)}
            onCommissionChange={(v) => setField('commission', v)}
            onUtilitiesChange={(v) => setField('utilities', v)}
          />
        )}
        {step === 6 && (
          <ReviewStep photos={photos} title={title} description={description} price={price} />
        )}
        {step === 7 && <PublishStep isSubmitting={isSubmitting} onPublish={() => void submit()} />}
      </div>

      {aiPreview && (
        <div className="rounded-[14px] border border-[var(--accent)]/40 bg-[var(--accent)]/10 p-4 space-y-3">
          <p className="text-[13px] font-semibold text-[var(--accent)]">AI сгенерировал варианты описания</p>
          <pre className="text-[13px] whitespace-pre-wrap text-[var(--text-primary)]">{aiPreview}</pre>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setField('description', aiPreview)
                setAiPreview(null)
              }}
              className="rounded-[10px] px-3 py-2 bg-[var(--accent)] text-[var(--button-primary-text)] text-[12px] font-semibold"
            >
              Применить
            </button>
            <button
              type="button"
              onClick={() => setAiPreview(null)}
              className="rounded-[10px] px-3 py-2 border border-[var(--border-main)] text-[12px] font-semibold text-[var(--text-primary)]"
            >
              Оставить как есть
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-[12px] border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-300">
          {error}
        </div>
      )}

      <AiListingPanel
        open={aiController.open && aiController.mode === 'listing'}
        onClose={aiController.closePanel}
        listing={{
          title,
          description,
          photosCount: photos.length,
          price: Number(price || 0),
          city,
          district,
          amenities: amenityKeys,
          typeLabel: TYPE_LABELS[type] ?? 'Жилье',
        }}
        onApplyDescription={(text) => {
          setField('description', text)
          aiController.closePanel()
        }}
      />

      {/* TZ-47: нижняя панель шагов — sticky, padding 12px 16px, background inherit */}
      <div
        className="sticky bottom-0 left-0 right-0 z-50 border-t border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-main)]"
        style={{
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mx-auto max-w-[680px] w-full flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={step === 0 ? onCancel : prevStep}
            className="h-12 min-h-[48px] flex-1 rounded-[12px] border-2 border-[var(--border-main)] bg-transparent text-[14px] font-medium text-[var(--text-primary)]"
          >
            Назад
          </button>
          {step < 7 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                setError(null)
                nextStep()
              }}
              className={cn(
                'h-12 min-h-[48px] flex-1 rounded-[12px] text-[14px] font-medium',
                canNext
                  ? 'bg-[var(--accent)] text-[var(--text-on-accent)] border-2 border-transparent'
                  : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed border-2 border-transparent'
              )}
            >
              Далее
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={isSubmitting}
              className="h-12 min-h-[48px] flex-1 rounded-[12px] bg-[var(--accent)] text-[var(--text-on-accent)] text-[14px] font-medium disabled:opacity-60 border-2 border-transparent"
            >
              {isSubmitting ? 'Публикация…' : 'Опубликовать'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

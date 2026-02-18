'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { CreateListingLayout } from '@/domains/listings/CreateListingLayout'
import { StepType, type PropertyType, type RentMode } from '@/domains/listings/steps/StepType'
import { StepAddress } from '@/domains/listings/steps/StepAddress'
import { StepPhotosV2, type PhotoItemV2 } from '@/domains/listings/steps/StepPhotosV2'
import { StepDetails } from '@/domains/listings/steps/StepDetails'
import { StepDescription } from '@/domains/listings/steps/StepDescription'
import { StepPrice } from '@/domains/listings/steps/StepPrice'
import { StepPreview } from '@/domains/listings/steps/StepPreview'

const TOTAL_STEPS = 8
const MIN_PHOTOS = 5
const MAX_PHOTOS = 30
/** ТЗ 14: одна формулировка требования к фото, без дублей */
const PHOTO_MIN_MSG = 'Добавьте минимум 5 фото'

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  studio: 'Студия',
  house: 'Дом',
  room: 'Комната',
  apartment_suite: 'Апартаменты',
}

function uuid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export interface CreateListingWizardV2Props {
  /** Вызывается после успешной публикации; при создании передаётся id объявления (для экрана «Продвинуть?»). */
  onSuccess?: (listingId?: string) => void
  onCancel?: () => void
  initialListing?: any | null
  onLimitReached?: () => void
}

type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export function CreateListingWizardV2({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: CreateListingWizardV2Props) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [step, setStep] = useState<WizardStepIndex>(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const [type, setType] = useState<PropertyType>('apartment')
  const [rentMode, setRentMode] = useState<RentMode>('month')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [building, setBuilding] = useState('')
  const [photoItems, setPhotoItems] = useState<PhotoItemV2[]>([])
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0)
  const [rooms, setRooms] = useState('')
  const [area, setArea] = useState('')
  const [floor, setFloor] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [repair, setRepair] = useState('')
  const [furniture, setFurniture] = useState('')
  const [appliances, setAppliances] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [commission, setCommission] = useState('')
  const [utilities, setUtilities] = useState('')

  const isEdit = Boolean(initialListing?.id)

  useEffect(() => {
    if (!initialListing) return
    setType((initialListing.houseRules?.type ?? initialListing.type ?? 'apartment') as PropertyType)
    setCity(initialListing.city ?? '')
    setDistrict('')
    setStreet('')
    setBuilding(initialListing.addressLine ?? '')
    setRooms(String(initialListing.bedrooms ?? ''))
    const hr = initialListing.houseRules || {}
    setArea(String(hr.area ?? ''))
    setFloor(String(hr.floor ?? ''))
    setTotalFloors(String(hr.totalFloors ?? ''))
    setTitle(initialListing.title ?? '')
    setDescription(initialListing.description ?? '')
    setPrice(String(initialListing.basePrice ?? ''))
    setDeposit(String(hr.deposit ?? ''))
    if (Array.isArray(initialListing.photos) && initialListing.photos.length > 0) {
      setPhotoItems(
        initialListing.photos.map((p: any) => ({
          id: p.id,
          previewUrl: p.url ?? '',
          isNew: false,
        }))
      )
    }
  }, [initialListing])

  const addressLine = useMemo(
    () => [district, street, building].filter(Boolean).join(', ') || city,
    [city, district, street, building]
  )
  const addressDisplay = useMemo(() => [city, district].filter(Boolean).join(', ') || '—', [city, district])

  const photoError = useMemo(() => {
    if (step !== 2) return null
    if (photoItems.length < MIN_PHOTOS) return PHOTO_MIN_MSG
    return null
  }, [step, photoItems.length])

  const canGoNext = useMemo(() => {
    if (step === 0) return true
    if (step === 1) return city.trim().length > 0
    if (step === 2) return photoItems.length >= MIN_PHOTOS
    if (step === 3 || step === 4) return true
    if (step === 5) return title.trim().length > 0
    if (step === 6) {
      const p = Number(price)
      return price.trim().length > 0 && !Number.isNaN(p) && p > 0
    }
    return true
  }, [step, city, photoItems.length, title, price])

  const addPhotos = useCallback((files: File[]) => {
    const toAdd = files.slice(0, MAX_PHOTOS - photoItems.length).map((file) => ({
      id: uuid(),
      file,
      previewUrl: URL.createObjectURL(file),
      isNew: true,
    }))
    setPhotoItems((prev) => {
      const next = [...prev, ...toAdd]
      return next.slice(0, MAX_PHOTOS)
    })
  }, [photoItems.length])

  const removePhoto = useCallback(
    async (id: string) => {
      const item = photoItems.find((p) => p.id === id)
      if (item && !item.isNew && initialListing?.id) {
        try {
          await apiFetch(
            `/listings/${encodeURIComponent(initialListing.id)}/photos/${encodeURIComponent(id)}`,
            { method: 'DELETE' }
          )
        } catch {
          /* leave in list on error */
        }
      }
      setPhotoItems((prev) => {
        const idx = prev.findIndex((p) => p.id === id)
        const next = prev.filter((p) => p.id !== id)
        if (idx >= 0 && prev[idx]?.isNew && prev[idx].previewUrl?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(prev[idx].previewUrl)
          } catch {
            /* ignore */
          }
        }
        setCoverPhotoIndex((c) => (c >= next.length ? Math.max(0, next.length - 1) : c))
        return next
      })
    },
    [photoItems, initialListing?.id]
  )

  const reorderPhotos = useCallback((from: number, to: number) => {
    setPhotoItems((prev) => {
      const arr = [...prev]
      const item = arr[from]
      if (!item) return prev
      arr.splice(from, 1)
      arr.splice(to, 0, item)
      setCoverPhotoIndex((c) => (c === from ? to : c === to ? from : c))
      return arr
    })
  }, [])

  const setCover = useCallback((index: number) => {
    setCoverPhotoIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setError(null)
    if (step === 2 && photoItems.length < MIN_PHOTOS) {
      setError(PHOTO_MIN_MSG)
      return
    }
    if (step === 1 && !city.trim()) {
      setError('Выберите город')
      return
    }
    if (step === 5 && !title.trim()) {
      setError('Введите заголовок')
      return
    }
    if (step === 6) {
      const p = Number(price)
      if (!price.trim() || Number.isNaN(p) || p <= 0) {
        setError('Укажите цену')
        return
      }
    }
    if (step < 6) setStep((s) => (s + 1) as WizardStepIndex)
  }, [step, photoItems.length, city, title, price])

  const goBack = useCallback(() => {
    setError(null)
    if (step > 0) setStep((s) => (s - 1) as WizardStepIndex)
  }, [step])

  const submit = useCallback(async () => {
    if (isSubmitting) return
    setError(null)
    if (photoItems.length < MIN_PHOTOS) {
      setError(PHOTO_MIN_MSG)
      return
    }
    if (!city.trim()) {
      setError('Выберите город')
      return
    }
    if (!title.trim()) {
      setError('Введите заголовок')
      return
    }
    const p = Number(price)
    if (!price.trim() || Number.isNaN(p) || p <= 0) {
      setError('Укажите цену')
      return
    }
    const limit = user?.listingLimit ?? 1
    const used = user?.listingUsed ?? 0
    if (!isEdit && used >= limit) {
      onLimitReached?.()
      return
    }
    setIsSubmitting(true)
    try {
      const apiType = (type === 'apartment_suite' ? 'apartment' : type).toUpperCase()
      const payload = {
        title: title.trim(),
        description: description.trim(),
        city: city.trim(),
        addressLine: addressLine.trim() || undefined,
        basePrice: p,
        currency: 'RUB',
        capacityGuests: 2,
        bedrooms: Number(rooms || '1') || 1,
        bathrooms: 1,
        type: apiType,
        houseRules: {
          area: Number(area || '0') || undefined,
          floor: Number(floor || '0') || undefined,
          totalFloors: Number(totalFloors || '0') || undefined,
          type: type,
          deposit: deposit.trim() ? Number(deposit) || undefined : undefined,
          negotiable: false,
        },
        amenityKeys: [],
      }

      let listingId: string | undefined = initialListing?.id
      if (isEdit) {
        await apiFetchJson(`/listings/${encodeURIComponent(String(listingId))}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        const createData = await apiFetchJson<any>('/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        listingId =
          createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId
        if (!listingId) throw new Error('Сервер не вернул ID нового объявления')
      }

      const newPhotos = photoItems.filter((p) => p.isNew && p.file)
      const toUpload = [...newPhotos]
      if (coverPhotoIndex < toUpload.length) {
        const [cover] = toUpload.splice(coverPhotoIndex, 1)
        if (cover) toUpload.unshift(cover)
      }
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i]?.file
        if (!file) continue
        const form = new FormData()
        form.append('file', file)
        form.append('sortOrder', String(i))
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/photos`, {
          method: 'POST',
          body: form,
        })
      }

      try {
        await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
      } catch {
        /* ignore */
      }
      onSuccess?.(listingId)
    } catch (err: any) {
      if (err?.code === 'LIMIT_REACHED') {
        onLimitReached?.()
        setError(err?.message ?? 'Лимит объявлений исчерпан')
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка при сохранении объявления')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    photoItems,
    coverPhotoIndex,
    city,
    title,
    price,
    description,
    addressLine,
    rooms,
    area,
    floor,
    totalFloors,
    deposit,
    type,
    user,
    isEdit,
    initialListing?.id,
    queryClient,
    onSuccess,
    onLimitReached,
  ])

  const currentStepDisplay = step + 1

  return (
    <div ref={topRef} className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
            {isEdit ? 'Редактировать объявление' : 'Новое объявление'}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            Шаг {currentStepDisplay} из {TOTAL_STEPS}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
          >
            Закрыть
          </button>
        )}
      </div>

      {error && (
        <p className="text-[14px] font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <CreateListingLayout
        currentStep={currentStepDisplay}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onNext={step === 6 ? undefined : goNext}
        nextLabel="Далее"
        nextDisabled={!canGoNext}
        hideNext={step === 6}
      >
        {step === 0 && (
          <StepType
            type={type}
            rentMode={rentMode}
            onTypeChange={setType}
            onRentModeChange={setRentMode}
          />
        )}
        {step === 1 && (
          <StepAddress
            city={city}
            district={district}
            street={street}
            building={building}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            onStreetChange={setStreet}
            onBuildingChange={setBuilding}
          />
        )}
        {step === 2 && (
          <StepPhotosV2
            items={photoItems}
            coverIndex={coverPhotoIndex}
            onAddFiles={addPhotos}
            onRemove={removePhoto}
            onReorder={reorderPhotos}
            onSetCover={setCover}
            error={photoError}
          />
        )}
        {step === 3 && (
          <StepDetails
            rooms={rooms}
            area={area}
            floor={floor}
            totalFloors={totalFloors}
            repair={repair}
            furniture={furniture}
            appliances={appliances}
            onRoomsChange={setRooms}
            onAreaChange={setArea}
            onFloorChange={setFloor}
            onTotalFloorsChange={setTotalFloors}
            onRepairChange={setRepair}
            onFurnitureChange={setFurniture}
            onAppliancesChange={setAppliances}
          />
        )}
        {step === 4 && (
          <StepDescription
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onGenerateDescription={() => {}}
          />
        )}
        {step === 5 && (
          <StepPrice
            rentMode={rentMode}
            price={price}
            deposit={deposit}
            commission={commission}
            utilities={utilities}
            onPriceChange={setPrice}
            onDepositChange={setDeposit}
            onCommissionChange={setCommission}
            onUtilitiesChange={setUtilities}
          />
        )}
        {step === 6 && (
          <div className="space-y-6">
            <StepPreview
              typeLabel={TYPE_LABELS[type]}
              rentMode={rentMode}
              addressDisplay={addressDisplay}
              photos={photoItems}
              coverIndex={coverPhotoIndex}
              title={title}
              description={description}
              price={price}
              deposit={deposit}
              rooms={rooms}
              area={area}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className={cn(
                  'rounded-[12px] px-6 py-3 font-semibold text-[15px] transition-colors',
                  isSubmitting
                    ? 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95'
                )}
              >
                {isSubmitting ? 'Публикация…' : 'Опубликовать'}
              </button>
            </div>
          </div>
        )}
      </CreateListingLayout>
    </div>
  )
}

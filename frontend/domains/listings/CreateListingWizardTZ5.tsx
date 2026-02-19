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
import { StepAmenities } from '@/domains/listings/steps/StepAmenities'
import { StepRules } from '@/domains/listings/steps/StepRules'

const TOTAL_STEPS = 10
const MIN_PHOTOS = 5
const MAX_PHOTOS = 30
const PHOTO_MIN_MSG = 'Добавьте минимум 5 фото'

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  studio: 'Студия',
  house: 'Дом',
  room: 'Комната',
  apartment_suite: 'Апартаменты',
}

const STEP_LABELS = [
  'Тип жилья',
  'Локация',
  'Характеристики',
  'Фото',
  'Описание',
  'Удобства',
  'Цена',
  'Правила',
  'Предпросмотр',
  'Публикация',
]

function uuid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export interface CreateListingWizardTZ5Props {
  onSuccess?: (listingId?: string) => void
  onCancel?: () => void
  initialListing?: any | null
  onLimitReached?: () => void
}

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export function CreateListingWizardTZ5({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: CreateListingWizardTZ5Props) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [step, setStep] = useState<StepIndex>(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<'free' | 'promote' | 'top'>('free')
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
  const [amenityKeys, setAmenityKeys] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [commission, setCommission] = useState('')
  const [utilities, setUtilities] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [pets, setPets] = useState('')
  const [smoking, setSmoking] = useState('')
  const [parties, setParties] = useState('')

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
    if (Array.isArray(initialListing.amenityKeys)) setAmenityKeys(initialListing.amenityKeys)
    if (Array.isArray(initialListing.amenities)) setAmenityKeys(initialListing.amenities.map((a: any) => (typeof a === 'string' ? a : a?.amenity?.key ?? a?.key)).filter(Boolean))
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

  const addressLine = useMemo(() => [district, street, building].filter(Boolean).join(', ') || city, [city, district, street, building])
  const addressDisplay = useMemo(() => [city, district].filter(Boolean).join(', ') || '—', [city, district])
  const photoError = useMemo(() => (step === 3 && photoItems.length < MIN_PHOTOS ? PHOTO_MIN_MSG : null), [step, photoItems.length])

  const canGoNext = useMemo(() => {
    if (step === 0) return true
    if (step === 1) return city.trim().length > 0
    if (step === 3) return photoItems.length >= MIN_PHOTOS
    if (step === 4) return title.trim().length > 0
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
    setPhotoItems((prev) => [...prev, ...toAdd].slice(0, MAX_PHOTOS))
  }, [photoItems.length])

  const removePhoto = useCallback(
    async (id: string) => {
      const item = photoItems.find((p) => p.id === id)
      if (item && !item.isNew && initialListing?.id) {
        try {
          await apiFetch(`/listings/${encodeURIComponent(initialListing.id)}/photos/${encodeURIComponent(id)}`, { method: 'DELETE' })
        } catch {}
      }
      setPhotoItems((prev) => {
        const next = prev.filter((p) => p.id !== id)
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
  const setCover = useCallback((index: number) => setCoverPhotoIndex(index), [])

  const goNext = useCallback(() => {
    setError(null)
    if (step === 1 && !city.trim()) {
      setError('Выберите город')
      return
    }
    if (step === 3 && photoItems.length < MIN_PHOTOS) {
      setError(PHOTO_MIN_MSG)
      return
    }
    if (step === 4 && !title.trim()) {
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
    if (step < 9) setStep((s) => (s + 1) as StepIndex)
  }, [step, city, photoItems.length, title, price])

  const goBack = useCallback(() => {
    setError(null)
    if (step > 0) setStep((s) => (s - 1) as StepIndex)
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
    const used = (user as any)?.listingUsed ?? 0
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
          checkIn: checkIn.trim() || undefined,
          checkOut: checkOut.trim() || undefined,
          pets: pets.trim() || undefined,
          smoking: smoking.trim() || undefined,
          parties: parties.trim() || undefined,
        },
        amenityKeys,
      }

      let listingId: string | undefined = initialListing?.id
      if (isEdit) {
        await apiFetchJson(`/listings/${encodeURIComponent(String(listingId))}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        const createData = await apiFetchJson<any>('/listings', { method: 'POST', body: JSON.stringify(payload) })
        listingId = createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId
        if (!listingId) throw new Error('Сервер не вернул ID')
      }

      const newPhotos = photoItems.filter((x) => x.isNew && x.file)
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
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/photos`, { method: 'POST', body: form })
      }

      try {
        await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
      } catch {}
      onSuccess?.(listingId)
    } catch (err: any) {
      if (err?.code === 'LIMIT_REACHED') {
        onLimitReached?.()
        setError(err?.message ?? 'Лимит объявлений исчерпан')
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
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
    checkIn,
    checkOut,
    pets,
    smoking,
    parties,
    amenityKeys,
    type,
    user,
    isEdit,
    initialListing?.id,
    queryClient,
    onSuccess,
    onLimitReached,
  ])

  const currentStepDisplay = step + 1
  const isPreviewStep = step === 8
  const isTariffStep = step === 9

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
          <button type="button" onClick={onCancel} className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]">
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
        onNext={isPreviewStep ? undefined : isTariffStep ? undefined : goNext}
        nextLabel={isPreviewStep ? 'Опубликовать' : 'Далее'}
        nextDisabled={!canGoNext && !isPreviewStep}
        hideNext={isPreviewStep || isTariffStep}
      >
        {step === 0 && <StepType type={type} rentMode={rentMode} onTypeChange={setType} onRentModeChange={setRentMode} />}
        {step === 1 && (
          <StepAddress city={city} district={district} street={street} building={building} onCityChange={setCity} onDistrictChange={setDistrict} onStreetChange={setStreet} onBuildingChange={setBuilding} />
        )}
        {step === 2 && (
          <StepDetails rooms={rooms} area={area} floor={floor} totalFloors={totalFloors} repair={repair} furniture={furniture} appliances={appliances} onRoomsChange={setRooms} onAreaChange={setArea} onFloorChange={setFloor} onTotalFloorsChange={setTotalFloors} onRepairChange={setRepair} onFurnitureChange={setFurniture} onAppliancesChange={setAppliances} />
        )}
        {step === 3 && (
          <StepPhotosV2 items={photoItems} coverIndex={coverPhotoIndex} onAddFiles={addPhotos} onRemove={removePhoto} onReorder={reorderPhotos} onSetCover={setCover} error={photoError} />
        )}
        {step === 4 && <StepDescription title={title} description={description} onTitleChange={setTitle} onDescriptionChange={setDescription} onGenerateDescription={() => {}} />}
        {step === 5 && <StepAmenities amenityKeys={amenityKeys} onChange={setAmenityKeys} />}
        {step === 6 && (
          <StepPrice rentMode={rentMode} price={price} deposit={deposit} commission={commission} utilities={utilities} onPriceChange={setPrice} onDepositChange={setDeposit} onCommissionChange={setCommission} onUtilitiesChange={setUtilities} />
        )}
        {step === 7 && (
          <StepRules checkIn={checkIn} checkOut={checkOut} pets={pets} smoking={smoking} parties={parties} onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut} onPetsChange={setPets} onSmokingChange={setSmoking} onPartiesChange={setParties} />
        )}
        {step === 8 && (
          <div className="space-y-6">
            <StepPreview typeLabel={TYPE_LABELS[type]} rentMode={rentMode} addressDisplay={addressDisplay} photos={photoItems} coverIndex={coverPhotoIndex} title={title} description={description} price={price} deposit={deposit} rooms={rooms} area={area} />
            <div className="flex justify-end">
              <button type="button" onClick={goNext} className="rounded-[12px] px-6 py-3 font-semibold text-[15px] bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95">
                Опубликовать
              </button>
            </div>
          </div>
        )}
        {step === 9 && (
          <div className="space-y-6">
            <p className="text-[14px] text-[var(--text-secondary)]">Выберите тариф публикации. Без выбора — бесплатная публикация.</p>
            <div className="grid gap-3">
              {[
                { id: 'free' as const, label: 'Базовый', price: 'Бесплатно' },
                { id: 'promote' as const, label: 'Продвинуть', price: 'от 299 ₽' },
                { id: 'top' as const, label: 'Поднять в топ', price: 'от 599 ₽' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedTariff(opt.id)}
                  className={cn(
                    'rounded-[12px] p-4 border-2 text-left flex items-center justify-between transition-all',
                    selectedTariff === opt.id ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border-main)] bg-[var(--bg-input)] hover:border-[var(--accent)]/50'
                  )}
                >
                  <span className="font-semibold text-[var(--text-primary)]">{opt.label}</span>
                  <span className="text-[14px] text-[var(--text-secondary)]">{opt.price}</span>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">Комиссия сервиса 7% от бронирования.</p>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className={cn(
                  'rounded-[12px] px-6 py-3 font-semibold text-[15px] transition-colors',
                  isSubmitting ? 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95'
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

'use client'

import Link from 'next/link'
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
import { toCanonicalStatus } from '@/domains/listings/listing-status'

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
  /** TZ-65: после публикации — экран «На модерации» или «Опубликовано» */
  const [publishResult, setPublishResult] = useState<{ status: 'moderation' | 'published'; listingId: string } | null>(null)
  /** TZ-65: модал подтверждения выхода */
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const isDirtyRef = useRef(false)

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

  /** TZ-65: автосохранение черновика при редактировании (debounce 800ms) */
  useEffect(() => {
    if (!initialListing?.id) return
    const t = window.setTimeout(() => {
      const p = Number(price)
      const apiType = (type === 'apartment_suite' ? 'apartment' : type).toUpperCase()
      const payload = {
        title: title.trim() || 'Черновик',
        description: description.trim(),
        city: city.trim(),
        addressLine: addressLine.trim() || undefined,
        basePrice: p || 0,
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
      apiFetchJson(`/listings/${encodeURIComponent(initialListing.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }).catch(() => {})
    }, 800)
    return () => window.clearTimeout(t)
  }, [
    initialListing?.id,
    type, city, addressLine, title, description, price, rooms, area, floor, totalFloors, deposit,
  ])

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
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (step === 1 && !city.trim()) {
      setError('Выберите город')
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (step === 5 && !title.trim()) {
      setError('Введите заголовок')
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (step === 6) {
      const p = Number(price)
      if (!price.trim() || Number.isNaN(p) || p <= 0) {
        setError('Укажите цену')
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    if (step < 6) setStep((s) => (s + 1) as WizardStepIndex)
  }, [step, photoItems.length, city, title, price])

  const goBack = useCallback(() => {
    setError(null)
    if (step > 0) setStep((s) => (s - 1) as WizardStepIndex)
  }, [step])

  /** TZ-65: сохранить черновик и выйти (без публикации) */
  const saveDraftAndExit = useCallback(async () => {
    setError(null)
    const p = Number(price)
    const apiType = (type === 'apartment_suite' ? 'apartment' : type).toUpperCase()
    const payload = {
      title: title.trim() || 'Черновик',
      description: description.trim(),
      city: city.trim(),
      addressLine: addressLine.trim() || undefined,
      basePrice: p || 0,
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
    try {
      let listingId: string | undefined = initialListing?.id
      if (listingId) {
        await apiFetchJson(`/listings/${encodeURIComponent(String(listingId))}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        const createData = await apiFetchJson<any>('/listings', { method: 'POST', body: JSON.stringify(payload) })
        listingId = createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId
        if (!listingId) throw new Error('Не удалось сохранить черновик')
      }
      const newPhotos = photoItems.filter((x) => x.isNew && x.file)
      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i]?.file
        if (!file) continue
        const form = new FormData()
        form.append('file', file)
        form.append('sortOrder', String(i))
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/photos`, { method: 'POST', body: form })
      }
      await queryClient.invalidateQueries({ queryKey: ['owner-listings'] }).catch(() => {})
      isDirtyRef.current = false
      setShowExitConfirm(false)
      onSuccess?.(listingId)
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка сохранения черновика')
    }
  }, [
    type, city, addressLine, title, description, price, rooms, area, floor, totalFloors, deposit,
    photoItems, initialListing?.id, queryClient, onSuccess,
  ])

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

      /** TZ-65: отправка на модерацию (или автоодобрение → published) */
      const publishRes = await apiFetchJson<{ item?: { statusCanonical?: string; status?: string } }>(
        `/listings/${encodeURIComponent(String(listingId))}/publish`,
        { method: 'POST' }
      )
      const canonical = toCanonicalStatus(publishRes?.item?.statusCanonical ?? publishRes?.item?.status)
      const isPublished = canonical === 'approved' || canonical === 'published'

      try {
        await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
      } catch {
        /* ignore */
      }
      isDirtyRef.current = false
      setPublishResult({
        status: isPublished ? 'published' : 'moderation',
        listingId: String(listingId),
      })
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
  const hasContent = city.trim() || title.trim() || price.trim() || photoItems.length > 0

  const handleCloseClick = useCallback(() => {
    if (hasContent) setShowExitConfirm(true)
    else onCancel?.()
  }, [hasContent, onCancel])

  const handleExitWithoutSave = useCallback(() => {
    setShowExitConfirm(false)
    isDirtyRef.current = false
    onCancel?.()
  }, [onCancel])

  const handleContinueEdit = useCallback(() => {
    setShowExitConfirm(false)
  }, [])

  /** TZ-65: успех публикации — экран с кнопками */
  if (publishResult) {
    return (
      <div className="create-listing-wizard space-y-6 max-w-md mx-auto">
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-2xl mx-auto" aria-hidden>
            {publishResult.status === 'published' ? '✓' : '🟡'}
          </div>
          <h2 className="text-[20px] font-bold text-[var(--text-primary)]">
            {publishResult.status === 'published'
              ? 'Объявление опубликовано'
              : 'Объявление отправлено на модерацию'}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {publishResult.status === 'published'
              ? 'Оно уже видно в поиске. Вы можете открыть его или продвинуть.'
              : 'Мы проверим объявление и уведомим о результате.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {publishResult.status === 'published' && (
              <>
                <Link
                  href={`/listings/${publishResult.listingId}`}
                  className="rounded-[12px] px-5 py-3 font-semibold text-[15px] bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95"
                >
                  Открыть
                </Link>
                <button
                  type="button"
                  onClick={() => onSuccess?.(publishResult.listingId)}
                  className="rounded-[12px] px-5 py-3 font-semibold text-[15px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                >
                  Продвинуть
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onSuccess?.(publishResult.listingId)}
              className="rounded-[12px] px-5 py-3 font-semibold text-[15px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
            >
              К моим объявлениям
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={topRef} className="create-listing-wizard space-y-6">
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
            onClick={handleCloseClick}
            className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
          >
            Закрыть
          </button>
        )}
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
          <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-main)] p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Выйти из формы?</h3>
            <p className="text-[14px] text-[var(--text-secondary)]">
              У вас есть несохранённые данные. Сохранить черновик или выйти без сохранения?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleContinueEdit}
                className="rounded-[12px] px-4 py-3 font-semibold text-[15px] bg-[var(--accent)] text-[var(--button-primary-text)]"
              >
                Продолжить редактирование
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false)
                  saveDraftAndExit()
                }}
                className="rounded-[12px] px-4 py-3 font-semibold text-[15px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)]"
              >
                Сохранить и выйти
              </button>
              <button
                type="button"
                onClick={handleExitWithoutSave}
                className="rounded-[12px] px-4 py-3 font-semibold text-[15px] text-[var(--danger)] hover:bg-[var(--danger)]/10"
              >
                Выйти без сохранения
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[14px] font-medium text-[var(--danger)]" role="alert">
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
        stepsLeft={step === 6 ? 0 : TOTAL_STEPS - currentStepDisplay}
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
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="rounded-[12px] px-5 py-3 font-semibold text-[15px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
              >
                Редактировать
              </button>
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

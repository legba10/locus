'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'

type DashboardTab = 'listings' | 'add' | 'bookings' | 'messages' | 'analytics' | 'profile'

/**
 * OwnerDashboardV7 — Полный кабинет арендодателя
 * 
 * Разделы:
 * 1. Мои объявления (с метриками, статусами, действиями)
 * 2. Добавить объявление (форма с drag&drop фото)
 * 3. Бронирования (список с действиями)
 * 4. Сообщения
 * 5. Аналитика (графики, KPI)
 * 6. Профиль
 */
export function OwnerDashboardV7() {
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<DashboardTab>('listings')

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══════════════════════════════════════════════════════════════
              SIDEBAR
              ═══════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-1">
            <div className={cn(
              'bg-white/[0.75] backdrop-blur-[22px]',
              'rounded-[20px]',
              'border border-white/60',
              'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
              'p-6 sticky top-6'
            )}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-6">Кабинет</h2>
              
              <nav className="space-y-1">
                {[
                  { id: 'listings' as DashboardTab, label: 'Мои объявления', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )},
                  { id: 'add' as DashboardTab, label: 'Добавить объявление', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )},
                  { id: 'bookings' as DashboardTab, label: 'Бронирования', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )},
                  { id: 'messages' as DashboardTab, label: 'Сообщения', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )},
                  { id: 'analytics' as DashboardTab, label: 'Аналитика', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )},
                  { id: 'profile' as DashboardTab, label: 'Профиль', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )},
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-[12px]',
                      'text-[14px] font-medium transition-all',
                      'flex items-center gap-2',
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white'
                        : 'text-[#6B7280] hover:bg-gray-100'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════
              ОСНОВНОЙ КОНТЕНТ
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            {activeTab === 'listings' && <MyListingsTab onAdd={() => setActiveTab('add')} />}
            {activeTab === 'add' && <AddListingTab onSuccess={() => setActiveTab('listings')} />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// МОИ ОБЪЯВЛЕНИЯ
// ═══════════════════════════════════════════════════════════════
function MyListingsTab({ onAdd }: { onAdd: () => void }) {
  const { data, isLoading } = useFetch<{ items: any[] }>(
    ['owner-listings'],
    '/api/listings?limit=50'
  )

  const listings = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1C1F26]">Мои объявления</h1>
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'px-5 py-2.5 rounded-[14px]',
            'bg-violet-600 text-white font-semibold text-[14px]',
            'hover:bg-violet-500 transition-colors'
          )}
        >
          + Добавить объявление
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-[18px] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className={cn(
          'bg-white rounded-[18px] p-12 text-center',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <p className="text-[16px] text-[#6B7280] mb-4">У вас пока нет объявлений</p>
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              'inline-block px-5 py-2.5 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[14px]',
              'hover:bg-violet-500 transition-colors'
            )}
          >
            Создать первое объявление
          </button>
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="space-y-4 scroll-container" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className={cn(
                'bg-white rounded-[18px] p-6',
                'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
                'border border-gray-100/80'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Фото */}
                <div className="w-32 h-24 rounded-[12px] overflow-hidden bg-gray-100 flex-shrink-0">
                  {listing.images?.[0]?.url ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      width={128}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized={listing.images[0].url.startsWith('http')}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-[#1C1F26] mb-2">
                    {(() => {
                      let cleanTitle = listing.title || 'Без названия'
                      cleanTitle = cleanTitle
                        .replace(/квартира рядом с метро #?\d*/gi, '')
                        .replace(/тихая квартира #?\d*/gi, '')
                        .replace(/рядом с метро #?\d*/gi, '')
                        .replace(/метро #?\d*/gi, '')
                        .replace(/квартира #?\d*/gi, '')
                        .trim()
                      if (!cleanTitle || cleanTitle.length < 3) {
                        cleanTitle = `Квартира ${listing.city || ''}`.trim() || 'Без названия'
                      }
                      return cleanTitle
                    })()}
                  </h3>
                  <p className="text-[14px] text-[#6B7280] mb-3">
                    {listing.city} • {formatPrice(listing.basePrice || listing.pricePerNight, 'month')}
                  </p>
                  
                  {/* Метрики */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-[13px] text-[#6B7280]">{listing.views || 0} просмотров</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[13px] text-[#6B7280]">{listing.bookings?.length || 0} бронирований</span>
                    </div>
                    {listing.aiScore && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[13px] text-violet-600 font-medium">AI: {listing.aiScore}%</span>
                      </div>
                    )}
                  </div>

                  {/* Статус и действия */}
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-3 py-1 rounded-lg text-[12px] font-medium',
                      listing.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : listing.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {listing.status === 'PUBLISHED' ? 'Опубликовано' : listing.status === 'PENDING' ? 'На модерации' : 'Скрыто'}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className={cn(
                          'px-4 py-2 rounded-[12px]',
                          'bg-gray-100 text-[#1C1F26] text-[13px] font-medium',
                          'hover:bg-gray-200 transition-colors'
                        )}
                      >
                        Открыть
                      </Link>
                      <button
                        className={cn(
                          'px-4 py-2 rounded-[12px]',
                          'bg-violet-600 text-white text-[13px] font-medium',
                          'hover:bg-violet-500 transition-colors'
                        )}
                      >
                        Редактировать
                      </button>
                      <button
                        className={cn(
                          'px-4 py-2 rounded-[12px]',
                          'bg-red-100 text-red-700 text-[13px] font-medium',
                          'hover:bg-red-200 transition-colors'
                        )}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ДОБАВИТЬ ОБЪЯВЛЕНИЕ
// ═══════════════════════════════════════════════════════════════
function AddListingTab({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    price: '',
    rooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    type: 'apartment',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setPhotos(prev => [...prev, ...newFiles].slice(0, 10))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newFiles].slice(0, 10))
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const title = formData.title.trim()
      const description = formData.description.trim()
      const city = formData.city.trim()
      const price = Number(formData.price)
      const rooms = Number(formData.rooms || '0')
      const area = Number(formData.area || '0')
      const floor = Number(formData.floor || '0')
      const totalFloors = Number(formData.totalFloors || '0')

      if (!title || !description || !city || !price || Number.isNaN(price)) {
        setError('Заполните название, описание, город и цену')
        setIsSubmitting(false)
        return
      }

      // 1) Создаём объявление через backend /api/listings
      const createPayload: any = {
        title,
        description,
        city,
        basePrice: price,
        capacityGuests: 2,
        bedrooms: rooms || 1,
        bathrooms: 1,
        houseRules: {},
      }

      if (area) {
        createPayload.houseRules = {
          ...(createPayload.houseRules || {}),
          area,
          floor,
          totalFloors,
          type: formData.type,
        }
      }

      const createData = await apiFetchJson<{ item?: { id: string }; id?: string; listingId?: string }>(
        '/listings',
        {
          method: 'POST',
          body: JSON.stringify(createPayload),
        },
      )

      const listingId: string | undefined =
        createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId

      if (!listingId) {
        throw new Error('Сервер не вернул ID нового объявления')
      }

      // 2) Загружаем фото через /api/listings/{id}/photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const form = new FormData()
        form.append('file', file)
        form.append('sortOrder', String(i))

        await apiFetch(
          `/listings/${encodeURIComponent(listingId)}/photos`,
          {
            method: 'POST',
            body: form,
          },
        )
      }

      // 3) Публикуем объявление (меняем статус с DRAFT на PUBLISHED)
      await apiFetch(
        `/listings/${encodeURIComponent(listingId)}/publish`,
        { method: 'POST' },
      )

      // 4) Обновляем список объявлений без перезагрузки
      await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })

      // 5) Сбрасываем форму
      setFormData({
        title: '',
        description: '',
        city: '',
        price: '',
        rooms: '',
        area: '',
        floor: '',
        totalFloors: '',
        type: 'apartment',
      })
      setPhotos([])

      // 6) Автоматически переключаемся на вкладку "Мои объявления"
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при сохранении объявления'
      setError(message)
      // eslint-disable-next-line no-console
      console.error('Create listing error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Добавить объявление</h1>

      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Фото (drag&drop) */}
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Фотографии</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-[14px] p-8 text-center transition-colors',
                dragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-300 bg-gray-50'
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[14px] text-[#6B7280] mb-1">
                  Перетащите фото сюда или <span className="text-violet-600">выберите файлы</span>
                </p>
                <p className="text-[12px] text-[#6B7280]">До 10 фотографий</p>
              </label>
            </div>
            
            {/* Превью фото */}
            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100">
                    <Image
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Название</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Квартира в центре"
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите ваше жильё..."
              rows={5}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                'resize-none'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Город</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              >
                <option value="">Выберите город</option>
                <option value="Москва">Москва</option>
                <option value="Санкт-Петербург">Санкт-Петербург</option>
                <option value="Казань">Казань</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Цена (₽/мес)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="30000"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Комнаты</label>
              <input
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                placeholder="2"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Площадь (м²)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="50"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Этаж</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="3"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Этажей в доме</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                placeholder="9"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Тип жилья</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            >
              <option value="apartment">Квартира</option>
              <option value="room">Комната</option>
              <option value="house">Дом</option>
              <option value="studio">Студия</option>
            </select>
          </div>

          {/* AI-подсказки (mock) */}
          <div className={cn(
            'bg-violet-50/80 rounded-[14px] p-4',
            'border border-violet-100'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-[13px] font-semibold text-violet-600">AI-подсказки</span>
            </div>
            <ul className="space-y-1 text-[12px] text-[#6B7280]">
              <li>• Добавьте минимум 5 фотографий для лучшего результата</li>
              <li>• Подробное описание увеличивает просмотры на 30%</li>
              <li>• Цена в диапазоне 25,000-35,000₽ имеет высокий спрос</li>
            </ul>
          </div>

          {error && (
            <p className="text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[15px]',
              'hover:bg-violet-500 transition-colors',
              'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
              isSubmitting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Создание...' : 'Создать объявление'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// БРОНИРОВАНИЯ
// ═══════════════════════════════════════════════════════════════
function BookingsTab() {
  const mockBookings = [
    { 
      id: '1', 
      listingTitle: 'Квартира в центре', 
      guestName: 'Иван Иванов', 
      guestEmail: 'ivan@example.com',
      status: 'new', 
      checkIn: '2026-02-01',
      checkOut: '2026-02-05',
      guests: 2,
      totalPrice: 12000
    },
    { 
      id: '2', 
      listingTitle: 'Студия у метро', 
      guestName: 'Мария Петрова', 
      guestEmail: 'maria@example.com',
      status: 'accepted', 
      checkIn: '2026-02-10',
      checkOut: '2026-02-15',
      guests: 1,
      totalPrice: 15000
    },
    { 
      id: '3', 
      listingTitle: 'Квартира в центре', 
      guestName: 'Петр Сидоров', 
      guestEmail: 'petr@example.com',
      status: 'rejected', 
      checkIn: '2026-02-20',
      checkOut: '2026-02-25',
      guests: 3,
      totalPrice: 18000
    },
  ]

  const handleBookingAction = (bookingId: string, action: 'accept' | 'reject') => {
    console.log(`Booking ${bookingId}: ${action}`)
    // TODO: API call
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Бронирования</h1>

      <div className="space-y-4">
        {mockBookings.map(booking => (
          <div
            key={booking.id}
            className={cn(
              'bg-white rounded-[18px] p-6',
              'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
              'border border-gray-100/80'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[#1C1F26] mb-1">{booking.listingTitle}</h3>
                <p className="text-[14px] text-[#6B7280] mb-2">{booking.guestName} • {booking.guestEmail}</p>
                <div className="flex items-center gap-4 text-[13px] text-[#6B7280] mb-2">
                  <span>📅 {booking.checkIn} - {booking.checkOut}</span>
                  <span>👥 {booking.guests} {booking.guests === 1 ? 'гость' : 'гостей'}</span>
                  <span className="font-semibold text-[#1C1F26]">{formatPrice(booking.totalPrice, 'month')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-3 py-1 rounded-lg text-[12px] font-medium',
                  booking.status === 'new'
                    ? 'bg-amber-100 text-amber-700'
                    : booking.status === 'accepted'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                )}>
                  {booking.status === 'new' ? 'Новое' : booking.status === 'accepted' ? 'Принято' : 'Отказано'}
                </span>
                {booking.status === 'new' && (
                  <>
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'accept')}
                      className="px-4 py-2 rounded-[12px] bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-500"
                    >
                      Принять
                    </button>
                    <button 
                      onClick={() => handleBookingAction(booking.id, 'reject')}
                      className="px-4 py-2 rounded-[12px] bg-red-600 text-white text-[13px] font-medium hover:bg-red-500"
                    >
                      Отклонить
                    </button>
                  </>
                )}
                <button className="px-4 py-2 rounded-[12px] bg-gray-100 text-[#1C1F26] text-[13px] font-medium hover:bg-gray-200">
                  Написать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// СООБЩЕНИЯ
// ═══════════════════════════════════════════════════════════════
function MessagesTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Сообщения</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-12 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[16px] text-[#6B7280]">Сообщения скоро появятся</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// АНАЛИТИКА — Расширенная версия с AI функциями
// ═══════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const mockStats = {
    views: { total: 1523, today: 45, change: 12, byDay: [120, 145, 132, 158, 145, 167, 180] },
    bookings: { total: 23, thisMonth: 8, change: 5, byDay: [2, 1, 3, 2, 1, 2, 3] },
    revenue: { total: 345000, thisMonth: 120000, change: 15, byDay: [15000, 18000, 16000, 20000, 17000, 19000, 21000] },
    conversion: { rate: 1.5, change: 0.3, trend: 'up' },
    aiScore: { average: 78, best: 92, worst: 45 },
    demand: { high: 5, medium: 8, low: 2 },
    priceAnalysis: { belowMarket: 3, average: 10, aboveMarket: 2 },
  }

  const aiRecommendations = [
    {
      id: '1',
      title: 'Оптимизация цены',
      description: '3 объявления имеют цену выше рынка на 15-20%',
      impact: 'high',
      action: 'Снизить цену на 10-15% для увеличения просмотров',
      potentialIncrease: '+25% просмотров'
    },
    {
      id: '2',
      title: 'Улучшение фотографий',
      description: '5 объявлений имеют менее 3 фотографий',
      impact: 'high',
      action: 'Добавить минимум 5 качественных фото',
      potentialIncrease: '+40% конверсии'
    },
    {
      id: '3',
      title: 'Оптимизация описаний',
      description: 'Описания слишком короткие, не содержат ключевых слов',
      impact: 'medium',
      action: 'Расширить описания, добавить информацию о районе и удобствах',
      potentialIncrease: '+18% просмотров'
    },
    {
      id: '4',
      title: 'Время публикации',
      description: 'Публикация в вечернее время увеличивает просмотры на 30%',
      impact: 'medium',
      action: 'Планировать публикацию новых объявлений на 18:00-20:00',
      potentialIncrease: '+30% просмотров'
    }
  ]

  return (
    <div className="space-y-6 scroll-container" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1C1F26]">Аналитика</h1>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#6B7280]">Период:</span>
          <select className={cn(
            'rounded-[14px] px-3 py-1.5 text-[13px]',
            'border border-white/60 bg-white/75 backdrop-blur-[18px]',
            'text-[#1C1F26] focus:outline-none focus:ring-2 focus:ring-violet-500/20',
            'shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
          )}>
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
            <option>Последние 3 месяца</option>
            <option>Все время</option>
          </select>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn(
          'bg-white rounded-[18px] p-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Просмотры</span>
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.views.total.toLocaleString()}</p>
          <p className="text-[12px] text-emerald-600">+{mockStats.views.change}% за месяц</p>
        </div>

        <div className={cn(
          'bg-white rounded-[18px] p-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Бронирования</span>
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.bookings.total}</p>
          <p className="text-[12px] text-emerald-600">+{mockStats.bookings.change} за месяц</p>
        </div>

        <div className={cn(
          'bg-white rounded-[18px] p-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Доход</span>
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{formatPrice(mockStats.revenue.total, 'month')}</p>
          <p className="text-[12px] text-emerald-600">+{mockStats.revenue.change}% за месяц</p>
        </div>

        <div className={cn(
          'bg-white rounded-[18px] p-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Конверсия</span>
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.conversion.rate}%</p>
          <p className="text-[12px] text-emerald-600">+{mockStats.conversion.change}% за месяц</p>
        </div>
      </div>

      {/* AI-анализ объявлений */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <h2 className="text-[18px] font-bold text-[#1C1F26]">AI-анализ ваших объявлений</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-violet-50 rounded-[12px] border border-violet-100">
            <p className="text-[12px] text-[#6B7280] mb-1">Средний AI-рейтинг</p>
            <p className="text-[24px] font-bold text-violet-600">{mockStats.aiScore.average}%</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-[12px] border border-emerald-100">
            <p className="text-[12px] text-[#6B7280] mb-1">Лучший рейтинг</p>
            <p className="text-[24px] font-bold text-emerald-600">{mockStats.aiScore.best}%</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-[12px] border border-amber-100">
            <p className="text-[12px] text-[#6B7280] mb-1">Требует улучшения</p>
            <p className="text-[24px] font-bold text-amber-600">{mockStats.aiScore.worst}%</p>
          </div>
        </div>

        {/* Анализ спроса */}
        <div className="mb-6">
          <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-3">Спрос по объявлениям</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]">
              <span className="text-[13px] text-[#1C1F26]">Высокий спрос</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(mockStats.demand.high / (mockStats.demand.high + mockStats.demand.medium + mockStats.demand.low)) * 100}%` }} />
                </div>
                <span className="text-[13px] font-semibold text-emerald-600">{mockStats.demand.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]">
              <span className="text-[13px] text-[#1C1F26]">Средний спрос</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(mockStats.demand.medium / (mockStats.demand.high + mockStats.demand.medium + mockStats.demand.low)) * 100}%` }} />
                </div>
                <span className="text-[13px] font-semibold text-amber-600">{mockStats.demand.medium}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]">
              <span className="text-[13px] text-[#1C1F26]">Низкий спрос</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(mockStats.demand.low / (mockStats.demand.high + mockStats.demand.medium + mockStats.demand.low)) * 100}%` }} />
                </div>
                <span className="text-[13px] font-semibold text-red-600">{mockStats.demand.low}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Анализ цены */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-3">Позиционирование цены</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-[12px] border border-emerald-100 text-center">
              <p className="text-[20px] font-bold text-emerald-600">{mockStats.priceAnalysis.belowMarket}</p>
              <p className="text-[11px] text-[#6B7280]">Ниже рынка</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-[12px] border border-blue-100 text-center">
              <p className="text-[20px] font-bold text-blue-600">{mockStats.priceAnalysis.average}</p>
              <p className="text-[11px] text-[#6B7280]">По рынку</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-[12px] border border-amber-100 text-center">
              <p className="text-[20px] font-bold text-amber-600">{mockStats.priceAnalysis.aboveMarket}</p>
              <p className="text-[11px] text-[#6B7280]">Выше рынка</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Рекомендации */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h2 className="text-[18px] font-bold text-[#1C1F26]">AI Рекомендации по оптимизации</h2>
        </div>
        <div className="space-y-4">
          {aiRecommendations.map(rec => (
            <div key={rec.id} className={cn(
              'p-5 rounded-[14px] border',
              rec.impact === 'high'
                ? 'bg-violet-50 border-violet-200'
                : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-semibold text-[#1C1F26]">{rec.title}</h4>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-[11px] font-medium',
                      rec.impact === 'high'
                        ? 'bg-violet-600 text-white'
                        : 'bg-blue-600 text-white'
                    )}>
                      {rec.impact === 'high' ? 'Высокий приоритет' : 'Средний приоритет'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-2">{rec.description}</p>
                  <p className="text-[13px] font-medium text-[#1C1F26] mb-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{rec.action}</span>
                  </p>
                  <p className="text-[13px] text-emerald-700 font-semibold">
                    Потенциальный рост: {rec.potentialIncrease}
                  </p>
                </div>
                <button className={cn(
                  'px-4 py-2 rounded-[12px] text-[13px] font-medium ml-4',
                  'bg-violet-600 text-white',
                  'hover:bg-violet-500 transition-colors'
                )}>
                  Применить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <h2 className="text-[16px] font-bold text-[#1C1F26] mb-4">Просмотры по дням</h2>
          <div className="h-64 bg-gray-50 rounded-[12px] flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-[13px] text-[#6B7280]">График просмотров скоро появится</p>
            </div>
          </div>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <h2 className="text-[16px] font-bold text-[#1C1F26] mb-4">Конверсия по объявлениям</h2>
          <div className="h-64 bg-gray-50 rounded-[12px] flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-[13px] text-[#6B7280]">График конверсии скоро появится</p>
            </div>
          </div>
        </div>
      </div>

      {/* Детальная статистика по объявлениям */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h2 className="text-[16px] font-bold text-[#1C1F26] mb-4">Статистика по объявлениям</h2>
        <div className="space-y-3">
          {[
            { title: 'Квартира в центре', views: 523, bookings: 8, conversion: 1.5, aiScore: 87 },
            { title: 'Современная студия', views: 234, bookings: 3, conversion: 1.3, aiScore: 72 },
            { title: 'Дом в Сочи', views: 156, bookings: 2, conversion: 1.3, aiScore: 65 },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-[12px] border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[14px] font-semibold text-[#1C1F26]">{item.title}</h4>
                <span className="text-[13px] font-semibold text-violet-600">AI: {item.aiScore}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-[#6B7280] mb-0.5">Просмотры</p>
                  <p className="text-[16px] font-bold text-[#1C1F26]">{item.views}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] mb-0.5">Бронирования</p>
                  <p className="text-[16px] font-bold text-[#1C1F26]">{item.bookings}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] mb-0.5">Конверсия</p>
                  <p className="text-[16px] font-bold text-[#1C1F26]">{item.conversion}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ПРОФИЛЬ
// ═══════════════════════════════════════════════════════════════
function ProfileTab() {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    email: user?.email || '',
    phone: '',
    verificationStatus: 'pending',
  })

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Профиль</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-gray-50',
                'text-[#1C1F26] text-[14px]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Статус верификации</label>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-3 py-1 rounded-lg text-[12px] font-medium',
                formData.verificationStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {formData.verificationStatus === 'verified' ? 'Верифицирован' : 'На проверке'}
              </span>
            </div>
          </div>
          <button
            className={cn(
              'w-full py-3 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[15px]',
              'hover:bg-violet-500 transition-colors'
            )}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  )
}

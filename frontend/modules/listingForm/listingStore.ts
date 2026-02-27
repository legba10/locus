'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type PropertyType = 'apartment' | 'studio' | 'house' | 'room' | 'apartment_suite'
export type RentMode = 'night' | 'month'
export type PhotoType = 'bedroom' | 'kitchen' | 'bathroom' | 'living_room' | 'facade' | 'other'

export interface ListingPhotoDraft {
  id: string
  url: string
  isNew: boolean
  file?: File
  type: PhotoType
  isCover: boolean
  order: number
}

interface ListingWizardState {
  step: WizardStep
  listingId: string | null
  type: PropertyType
  rentMode: RentMode
  city: string
  district: string
  street: string
  building: string
  lat: number | null
  lng: number | null
  photos: ListingPhotoDraft[]
  title: string
  description: string
  amenityKeys: string[]
  price: string
  deposit: string
  commission: string
  utilities: string
  isHydrated: boolean
  hydrate: () => void
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  setField: <K extends keyof Omit<ListingWizardState, 'setField' | 'setStep' | 'nextStep' | 'prevStep' | 'reset' | 'hydrate' | 'isHydrated'>>(
    key: K,
    value: ListingWizardState[K]
  ) => void
  setPhotos: (photos: ListingPhotoDraft[]) => void
  reset: () => void
  hydrateFromListing: (listing: any) => void
}

const initialState = {
  step: 0 as WizardStep,
  listingId: null as string | null,
  type: 'apartment' as PropertyType,
  rentMode: 'month' as RentMode,
  city: '',
  district: '',
  street: '',
  building: '',
  lat: null as number | null,
  lng: null as number | null,
  photos: [] as ListingPhotoDraft[],
  title: '',
  description: '',
  amenityKeys: [] as string[],
  price: '',
  deposit: '',
  commission: '',
  utilities: '',
}

function mapInitialPhotos(photos: any[] | undefined): ListingPhotoDraft[] {
  if (!Array.isArray(photos)) return []
  return photos.map((p, idx) => ({
    id: String(p?.id ?? `${idx}`),
    url: String(p?.url ?? ''),
    isNew: false,
    type: 'other',
    isCover: idx === 0,
    order: idx,
  }))
}

export const useListingWizardStore = create<ListingWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      isHydrated: false,
      hydrate: () => set({ isHydrated: true }),
      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(7, s.step + 1) as WizardStep })),
      prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) as WizardStep })),
      setField: (key, value) => set({ [key]: value } as Partial<ListingWizardState>),
      setPhotos: (photos) => set({ photos }),
      reset: () => set({ ...initialState, isHydrated: true }),
      hydrateFromListing: (listing) => {
        if (!listing) return
        const hr = listing?.houseRules ?? {}
        const amenityKeys = Array.isArray(listing?.amenityKeys)
          ? listing.amenityKeys
          : Array.isArray(listing?.amenities)
            ? listing.amenities
                .map((a: any) => (typeof a === 'string' ? a : a?.amenity?.key ?? a?.key))
                .filter(Boolean)
            : []
        const city = String(listing?.city ?? '')
        const addressLine = String(listing?.addressLine ?? '')
        const [district, street, building] = addressLine.split(',').map((x) => x.trim())
        set({
          listingId: String(listing?.id ?? ''),
          step: 0,
          type: (hr?.type ?? String(listing?.type ?? 'apartment').toLowerCase()) as PropertyType,
          city,
          district: district ?? '',
          street: street ?? '',
          building: building ?? '',
          lat: typeof listing?.lat === 'number' ? listing.lat : null,
          lng: typeof listing?.lng === 'number' ? listing.lng : null,
          title: String(listing?.title ?? ''),
          description: String(listing?.description ?? ''),
          price: String(listing?.basePrice ?? ''),
          deposit: String(hr?.deposit ?? ''),
          amenityKeys,
          photos: mapInitialPhotos(listing?.photos),
          isHydrated: true,
        })
      },
    }),
    {
      name: 'locus-listing-wizard-tz48',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => window.localStorage)
          : undefined,
      partialize: (state) => ({
        step: state.step,
        listingId: state.listingId,
        type: state.type,
        rentMode: state.rentMode,
        city: state.city,
        district: state.district,
        street: state.street,
        building: state.building,
        lat: state.lat,
        lng: state.lng,
        photos: state.photos.map((p) => ({
          id: p.id,
          url: p.url,
          isNew: false,
          type: p.type,
          isCover: p.isCover,
          order: p.order,
        })),
        title: state.title,
        description: state.description,
        amenityKeys: state.amenityKeys,
        price: state.price,
        deposit: state.deposit,
        commission: state.commission,
        utilities: state.utilities,
      }),
      onRehydrateStorage: () => (state) => state?.hydrate(),
    }
  )
)

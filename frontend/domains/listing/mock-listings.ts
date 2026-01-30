import type { Listing } from './listing-types'

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'lst_1',
    title: 'Современная квартира',
    city: 'Москва',
    pricePerNight: 47500,
    currency: 'RUB',
    rating: 4.9,
    reviewCount: 128,
    badges: ['SUPERHOST', 'INSTANT_BOOK'],
    images: [
      { url: '/listing-placeholder.svg', alt: 'Современная квартира' },
    ],
    hostId: 'host_1',
  },
  {
    id: 'lst_2',
    title: 'Современная студия',
    city: 'Москва',
    pricePerNight: 45000,
    currency: 'RUB',
    rating: 4.7,
    reviewCount: 74,
    badges: ['NEW'],
    images: [
      { url: '/listing-placeholder.svg', alt: 'Современная студия' },
    ],
    hostId: 'host_1',
  },
  {
    id: 'lst_3',
    title: 'Дом в Сочи',
    city: 'Сочи',
    pricePerNight: 120000,
    currency: 'RUB',
    rating: 4.9,
    reviewCount: 203,
    badges: ['SUPERHOST'],
    images: [
      { url: '/listing-placeholder.svg', alt: 'Дом в Сочи' },
    ],
    hostId: 'host_2',
  },
]



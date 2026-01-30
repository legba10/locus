export type BookingId = string

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export type Booking = {
  id: BookingId
  listingId: string
  userId: string
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  guests: number
  totalPrice: number
  currency: 'USD' | 'EUR' | 'RUB'
  status: BookingStatus
  createdAt: string
}


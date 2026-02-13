import { render, screen } from '@testing-library/react'
import { ListingCard } from '@/domains/listing/ListingCard'
import type { Listing } from '@/domains/listing'

const listing: Listing & { images?: { url: string }[] } = {
  id: 'lst_test',
  title: 'Test listing',
  city: 'Berlin',
  pricePerNight: 99,
  currency: 'USD',
  rating: 4.5,
  reviewCount: 10,
  badges: ['NEW'],
  images: [{ url: 'https://picsum.photos/seed/test/900/600', alt: 'Cover' }],
  hostId: 'host_1',
}

describe('ListingCard', () => {
  it('renders as a button (full card click) with title and aria-label', () => {
    render(<ListingCard listing={listing} />)

    const card = screen.getByRole('button', { name: /открыть объявление: test listing/i })
    expect(card).toBeInTheDocument()
    expect(screen.getByText('Test listing')).toBeInTheDocument()
  })
})

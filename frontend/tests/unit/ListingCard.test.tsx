import { render, screen } from '@testing-library/react'
import { ListingCard } from '@/domains/listing/ListingCard'
import type { Listing } from '@/domains/listing'

const listing: Listing = {
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
  it('renders as an anchor (Link root) with aria-label', () => {
    render(<ListingCard listing={listing} />)

    const link = screen.getByRole('link', { name: /open listing: test listing/i })
    expect(link).toHaveAttribute('href', `/listings/${listing.id}`)
    expect(screen.getByText('Test listing')).toBeInTheDocument()
  })
})


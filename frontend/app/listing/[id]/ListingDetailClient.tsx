'use client'

import { useNewListingUI } from '@/config/uiFlags'
import ListingPage from '@/features/listing/ListingPage'
import { ListingPageTZ8 } from '@/domains/listing/ListingPageTZ8'
import { ListingPageLight } from '@/domains/listing/ListingPageLight'

interface ListingDetailClientProps {
  id: string
  initialListing: { listing?: unknown; item?: unknown }
}

export function ListingDetailClient({ id, initialListing }: ListingDetailClientProps) {
  if (useNewListingUI) {
    return <ListingPage id={id} initialListing={initialListing} />
  }
  return <ListingPageLight id={id} />
}

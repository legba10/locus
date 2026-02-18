'use client'

import { useParams } from 'next/navigation'
import { useNewListingUI } from '@/config/uiFlags'
import { ListingPageLight } from '@/domains/listing/ListingPageLight'
import { ListingPageTZ8 } from '@/domains/listing/ListingPageTZ8'

export default function PageClient() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  if (useNewListingUI) return <ListingPageTZ8 id={id} />
  return <ListingPageLight id={id} />
}

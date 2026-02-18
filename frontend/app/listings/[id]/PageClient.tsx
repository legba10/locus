'use client'

import { useParams } from 'next/navigation'
import { useNewListingUI, useListingPageTZ8 } from '@/config/uiFlags'
import { ListingPageLight } from '@/domains/listing/ListingPageLight'
import { ListingPageV2TZ1 } from '@/domains/listing/ListingPageV2TZ1'
import { ListingPageTZ8 } from '@/domains/listing/ListingPageTZ8'

export default function PageClient() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  if (useNewListingUI && useListingPageTZ8) return <ListingPageTZ8 id={id} />
  if (useNewListingUI) return <ListingPageV2TZ1 id={id} />
  return <ListingPageLight id={id} />
}

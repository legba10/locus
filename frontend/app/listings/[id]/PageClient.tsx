'use client'

import { useParams } from 'next/navigation'
import { ListingPageLight } from '@/domains/listing/ListingPageLight'

export default function PageClient() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  return <ListingPageLight id={id} />
}

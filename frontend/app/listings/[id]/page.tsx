import { ListingPageLight } from '@/domains/listing/ListingPageLight'

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingPageLight id={params.id} />
}

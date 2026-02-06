import { PricingPageClient } from './PricingPageClient'

export const dynamic = 'force-dynamic'

export default function PricingPage({
  searchParams,
}: {
  searchParams?: { reason?: string }
}) {
  return <PricingPageClient reason={searchParams?.reason ?? null} />
}

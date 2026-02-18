import { useNewListingUI, useListingCardTZ7 } from '@/config/uiFlags'
import { ListingCard as ListingCardCurrent, ListingCardSkeleton as ListingCardSkeletonCurrent } from './ListingCard'
import { ListingCardV2, ListingCardV2Skeleton } from './ListingCardV2'
import { ListingCardTZ7, ListingCardTZ7Skeleton } from './ListingCardTZ7'

export type { ListingCardProps, ListingCardOwner, ListingCardBadge } from './ListingCard'
export type { ListingCardTZ7Props } from './ListingCardTZ7'
export { ListingCardV2, ListingCardV2Skeleton } from './ListingCardV2'
export { ListingCardTZ7, ListingCardTZ7Skeleton } from './ListingCardTZ7'

export const ListingCard = useNewListingUI
  ? (useListingCardTZ7 ? ListingCardTZ7 : ListingCardV2)
  : ListingCardCurrent
export const ListingCardSkeleton = useNewListingUI
  ? (useListingCardTZ7 ? ListingCardTZ7Skeleton : ListingCardV2Skeleton)
  : ListingCardSkeletonCurrent
export { ListingGallery } from './ListingGallery'
export { ListingHeader } from './ListingHeader'
export { ListingOwner } from './ListingOwner'
export { ListingCta } from './ListingCta'
export { ListingBooking } from './ListingBooking'
export { ReviewFormStepByStep } from './ReviewFormStepByStep'
export { ReviewWizard } from './ReviewWizard'
export { ListingMetricsCard } from './ListingMetricsCard'
export { ReviewCard } from './ReviewCard'

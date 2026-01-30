import { Suspense } from 'react'
import { SearchPageV4 } from './SearchPageV4'

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <SearchPageV4 />
    </Suspense>
  )
}

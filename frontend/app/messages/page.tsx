import MessagesClient from './MessagesClient'

export const dynamic = 'force-dynamic'

/**
 * ТЗ-11: Server component — без useSearchParams/useRouter.
 * Suspense boundary внутри MessagesClient оборачивает MessagesInner.
 */
export default function Page() {
  return <MessagesClient />
}

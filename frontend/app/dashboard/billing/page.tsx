import { redirect } from 'next/navigation'

/** TZ-21: Финансы. */
export default function DashboardBillingPage() {
  redirect('/owner/dashboard?tab=finances')
}

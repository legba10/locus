import { redirect } from 'next/navigation'

/** TZ-21: Мои объявления. */
export default function DashboardListingsPage() {
  redirect('/owner/dashboard?tab=listings')
}

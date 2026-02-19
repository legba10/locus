import { redirect } from 'next/navigation'

/** TZ-21: Продвижение. */
export default function DashboardPromoPage() {
  redirect('/owner/dashboard?tab=promotion')
}

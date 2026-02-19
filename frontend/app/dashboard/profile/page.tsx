import { redirect } from 'next/navigation'

/** TZ-21: Профиль кабинета. */
export default function DashboardProfilePage() {
  redirect('/profile')
}

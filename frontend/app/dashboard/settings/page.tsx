import { redirect } from 'next/navigation'

/** TZ-21: Настройки. */
export default function DashboardSettingsPage() {
  redirect('/profile/settings')
}

import { redirect } from 'next/navigation'

/** TZ-21: Добавить объявление. Единый URL /dashboard/listings/create → форма создания. */
export default function DashboardCreateListingPage() {
  redirect('/create-listing')
}

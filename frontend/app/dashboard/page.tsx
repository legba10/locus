import { redirect } from 'next/navigation'

/** TZ-21: Единая точка входа в кабинет. Редирект на профиль (гость/арендатор) или кабинет владельца. */
export default function DashboardPage() {
  redirect('/profile')
}

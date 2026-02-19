import { redirect } from 'next/navigation'

/** TZ-24: Сообщения кабинета — единый URL /dashboard/messages → /messages */
export default function DashboardMessagesPage() {
  redirect('/messages')
}

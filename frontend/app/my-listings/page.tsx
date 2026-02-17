import { redirect } from "next/navigation";

/**
 * ТЗ №6: раздел «Мои объявления».
 * Перенаправление на кабинет с вкладкой объявлений.
 */
export default function MyListingsPage() {
  redirect("/owner/dashboard?tab=listings");
}

import type { ReactNode } from 'react'
import { ProfileLayoutV2 } from '@/components/profile/ProfileLayoutV2'

/** ТЗ-8: Единый кабинет — тот же сайдбар (Профиль, Мои объявления, Бронирования, …), что и на /profile. */
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <ProfileLayoutV2>{children}</ProfileLayoutV2>
}

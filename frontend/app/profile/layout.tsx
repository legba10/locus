'use client'

import { useProfileV2 } from '@/config/uiFlags'
import { ProfileLayoutV2 } from '@/components/profile/ProfileLayoutV2'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  if (!useProfileV2) return <>{children}</>
  return <ProfileLayoutV2>{children}</ProfileLayoutV2>
}

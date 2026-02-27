'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const MOBILE_BREAKPOINT = 768
const BODY_CLASS = 'profile-route-mobile'

/**
 * TZ-61: на мобильной версии в профиле скрываем footer.
 * Вешаем на body класс profile-route-mobile при pathname.startsWith('/profile') и width < 768.
 */
export function ProfileRouteBodyClass() {
  const pathname = usePathname()

  useEffect(() => {
    const isProfile = pathname?.startsWith('/profile') ?? false
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
      if (document.body) {
        if (isProfile && mobile) {
          document.body.classList.add(BODY_CLASS)
        } else {
          document.body.classList.remove(BODY_CLASS)
        }
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [pathname])

  return null
}

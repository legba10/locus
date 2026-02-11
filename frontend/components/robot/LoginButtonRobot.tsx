'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_LOGIN_ROBOT } from '@/config/uiFlags'

const AI_URL = '/lottie/ai.json'

type Props = {
  loading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
}

export default function LoginButtonRobot({ loading, children, className, disabled, type = 'submit', onClick }: Props) {
  const [data, setData] = useState<object | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (!ENABLE_LOGIN_ROBOT) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    fetch(AI_URL)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const showRobot = ENABLE_LOGIN_ROBOT && !reducedMotion && loading && data

  return (
    <button type={type} disabled={disabled} className={className} onClick={onClick}>
      {showRobot && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8">
          <Lottie
            animationData={data}
            loop
            autoplay
            rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
            style={{ width: 32, height: 32 }}
          />
        </div>
      )}
      {children}
    </button>
  )
}

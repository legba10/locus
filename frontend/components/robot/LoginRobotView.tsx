'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { ENABLE_LOGIN_ROBOT } from '@/config/uiFlags'
import type { RobotState } from './types'

const ROBOT_URL = '/lottie/ai.json'
const ERROR_URL = '/lottie/Error.json'

export default function LoginRobotView({ state }: { state: RobotState }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [robotData, setRobotData] = useState<object | null>(null)
  const [errorData, setErrorData] = useState<object | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (!ENABLE_LOGIN_ROBOT) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!ENABLE_LOGIN_ROBOT) return
    Promise.all([
      fetch(ROBOT_URL).then((r) => r.json()),
      fetch(ERROR_URL).then((r) => r.json()),
    ])
      .then(([robot, err]) => {
        setRobotData(robot)
        setErrorData(err)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const inst = lottieRef.current
    if (!inst) return
    switch (state) {
      case 'idle':
        inst.setSpeed(0.5)
        break
      case 'typing':
        inst.setSpeed(1.5)
        break
      case 'thinking':
        inst.setSpeed(1.2)
        break
      case 'error':
        inst.setSpeed(2)
        break
      default:
        inst.setSpeed(0.8)
    }
  }, [state])

  if (!ENABLE_LOGIN_ROBOT || reducedMotion || isMobile || !robotData) return null
  if (state === 'success') return null
  const animationData = state === 'error' && errorData ? errorData : robotData

  return (
    <div className="absolute right-4 top-0 w-20 h-20 md:right-6 md:w-24 md:h-24 pointer-events-none z-10 flex items-center justify-end">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        style={{ width: 80, height: 80 }}
        className="md:w-24 md:h-24"
      />
    </div>
  )
}

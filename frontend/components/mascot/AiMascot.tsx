'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { useMascotState } from './useMascotState'
import { mascotController } from './mascotController'

const ROBOT_URL = '/lottie/robot.json'
const ERROR_URL = '/lottie/Error.json'

const hideRoutes = ['/profile', '/admin', '/create']

function isRouteHidden(pathname: string): boolean {
  return hideRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

function useIsLowPerformance(): boolean {
  const [low, setLow] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4
    setLow(reducedMotion || cores < 2)
  }, [])
  return low
}

export default function AiMascot() {
  const pathname = usePathname()
  const state = useMascotState()
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [robotData, setRobotData] = useState<object | null>(null)
  const [errorData, setErrorData] = useState<object | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const lowPerf = useIsLowPerformance()

  useEffect(() => {
    Promise.all([
      fetch(ROBOT_URL).then((r) => r.json()).catch(() => null),
      fetch(ERROR_URL).then((r) => r.json()).catch(() => null),
    ]).then(([robot, err]) => {
      setRobotData(robot ?? null)
      setErrorData(err ?? null)
    })
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const inst = lottieRef.current
    if (!inst) return
    const speed = isMobile ? 0.5 : 0.6
    switch (state) {
      case 'idle':
        inst.setSpeed(speed)
        break
      case 'hoverAI':
        inst.setSpeed(isMobile ? 0.6 : 0.8)
        break
      case 'thinking':
        inst.setSpeed(isMobile ? 0.6 : 1.2)
        break
      case 'error':
        inst.setSpeed(2)
        break
      default:
        inst.setSpeed(speed)
    }
  }, [state, isMobile])

  useEffect(() => {
    if (state !== 'error') return
    const t = setTimeout(() => mascotController.setIdle(), 3000)
    return () => clearTimeout(t)
  }, [state])

  if (typeof pathname !== 'string' || isRouteHidden(pathname) || lowPerf) return null
  if (state === 'hidden') return null
  if (!robotData) return null

  const animationData = state === 'error' && errorData ? errorData : robotData
  const size = isMobile ? 70 : 120

  return (
    <div
      className="fixed bottom-6 right-6 z-[30] pointer-events-none"
      style={{
        width: size,
        height: size,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-hidden
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        style={{ width: size, height: size }}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_ANIMATIONS } from '@/config/animations'

const BUBBLE_URL = '/lottie/Buuble.json'

export default function MobileBubble() {
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    if (!ENABLE_ANIMATIONS) return
    fetch(BUBBLE_URL)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!ENABLE_ANIMATIONS || !data) return null

  return (
    <div className="md:hidden fixed bottom-24 left-4 w-[80px] pointer-events-none z-40 animate-bounce">
      <Lottie animationData={data} loop />
    </div>
  )
}

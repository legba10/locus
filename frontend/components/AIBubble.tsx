'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_ANIMATIONS } from '@/config/animations'

const AI_URL = '/lottie/ai.json'

export default function AIBubble() {
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    if (!ENABLE_ANIMATIONS) return
    fetch(AI_URL)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!ENABLE_ANIMATIONS || !data) return null

  return (
    <div className="w-[28px] h-[28px] flex-shrink-0">
      <Lottie animationData={data} loop={false} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_ANIMATIONS } from '@/config/animations'

const BUBBLE_URL = '/lottie/Buuble.json'

export default function GlobalLoader() {
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
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="w-[140px]">
        <Lottie animationData={data} loop />
      </div>
    </div>
  )
}

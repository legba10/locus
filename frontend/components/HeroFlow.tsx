'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_ANIMATIONS } from '@/config/animations'

const FLOW_URL = '/lottie/Flow%201.json'

export default function HeroFlow() {
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    if (!ENABLE_ANIMATIONS) return
    fetch(FLOW_URL)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!ENABLE_ANIMATIONS || !data) return null

  return (
    <div className="absolute right-0 top-0 w-[280px] md:w-[300px] opacity-80 pointer-events-none">
      <Lottie animationData={data} loop />
    </div>
  )
}

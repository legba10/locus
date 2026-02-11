'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { ENABLE_ANIMATIONS } from '@/config/animations'

const ERROR_URL = '/lottie/Error.json'

export default function ErrorAnim() {
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    if (!ENABLE_ANIMATIONS) return
    fetch(ERROR_URL)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!ENABLE_ANIMATIONS || !data) return null

  return (
    <div className="w-[160px] md:w-[200px] mx-auto">
      <Lottie animationData={data} loop={false} />
    </div>
  )
}

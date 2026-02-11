'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ENABLE_LOGIN_ROBOT } from '@/config/uiFlags'
import type { RobotState } from './types'

const LoginRobotView = dynamic(() => import('./LoginRobotView'), { ssr: false })

type RenderProps = {
  setRobotState: (s: RobotState) => void
}

export default function LoginRobotController({
  children,
}: {
  children: (props: RenderProps) => React.ReactNode
}) {
  const [state, setState] = useState<RobotState>('idle')

  if (!ENABLE_LOGIN_ROBOT) {
    return <>{children({ setRobotState: () => {} })}</>
  }

  return (
    <div className="relative">
      <LoginRobotView state={state} />
      {children({ setRobotState: setState })}
    </div>
  )
}

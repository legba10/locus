'use client'

import { useEffect, useState } from 'react'
import { mascotController, type MascotState } from './mascotController'

export function useMascotState(): MascotState {
  const [state, setState] = useState<MascotState>(mascotController.getState())

  useEffect(() => {
    setState(mascotController.getState())
    return mascotController.subscribe(setState)
  }, [])

  return state
}

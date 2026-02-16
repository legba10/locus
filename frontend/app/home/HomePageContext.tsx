'use client'

import { createContext } from 'react'

export type HomePageContextValue = Record<string, unknown> | null

export const HomePageContext = createContext<HomePageContextValue>(null)

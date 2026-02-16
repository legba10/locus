'use client'

import { useContext } from 'react'
import { HomePageContext } from './HomePageContext'

export function HomePageView() {
  const ctx = useContext(HomePageContext)
  if (!ctx) return null
  return <div className="home-tz18 home-tz3 home-tz6 min-h-screen font-sans antialiased bg-[var(--background)]">Content</div>
}

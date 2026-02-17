'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * ТЗ: новый фон hero — градиент + изогнутые линии карты + точки.
 * Ощущение: дорогой AI-сервис недвижимости, намёк на карту, без grid/квадратов.
 */
export function HeroBackground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        rafId = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const parallaxY = scrollY * 0.1

  return (
    <div
      ref={wrapRef}
      className="hero-bg-new absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Слой 1 — мягкий градиент (тема в CSS) */}
      <div className="hero-bg-gradient absolute inset-0" />

      {/* Слой 2 — изогнутые линии (дороги) */}
      <svg
        className="hero-bg-lines absolute inset-0 w-full h-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translateY(${parallaxY}px)`,
          opacity: 0.15,
          filter: 'blur(0.3px)',
        }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <g className="hero-bg-lines-group" fill="none" stroke="#8B7CFF" strokeWidth="0.6" strokeOpacity="0.08">
          <path d="M 0,120 Q 200,80 400,120 T 800,100 T 1200,140" />
          <path d="M 0,280 Q 350,320 600,260 T 1200,300" />
          <path d="M 0,420 Q 250,380 500,440 T 1000,400 L 1200,420" />
          <path d="M 100,0 Q 100,200 150,400 Q 200,550 100,700" />
          <path d="M 400,0 Q 450,250 400,500 T 380,700" />
          <path d="M 700,0 Q 650,180 720,360 T 680,700" />
          <path d="M 1000,0 Q 950,300 1000,500 L 1000,700" />
          <path d="M 150,250 Q 400,200 650,280 Q 900,360 1050,320" />
          <path d="M 200,500 Q 500,480 800,520 Q 1100,540 1200,500" />
          <path d="M 50,350 Q 300,400 550,350 T 1150,380" />
          <path d="M 300,150 Q 500,100 700,180 T 1100,120" />
          <path d="M 0,580 Q 400,620 800,560 L 1200,600" />
          <path d="M 180,600 Q 600,550 1000,620" />
          <path d="M 500,0 Q 520,350 500,700" />
          <path d="M 0,200 Q 600,250 1200,180" />
        </g>
      </svg>

      {/* Слой 3 — точки-локации */}
      <svg
        className="hero-bg-dots absolute inset-0 w-full h-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translateY(${parallaxY}px)`,
        }}
      >
        <g className="hero-bg-dots-group" fill="#9F8CFF" style={{ filter: 'blur(1px)' }}>
          {[
            [120, 100], [380, 180], [620, 90], [900, 150], [1100, 200],
            [80, 300], [300, 350], [550, 320], [800, 380], [1050, 340],
            [200, 480], [450, 520], [700, 460], [950, 500], [150, 600],
            [400, 580], [650, 620], [880, 560], [500, 250], [750, 280],
            [320, 420], [580, 440], [820, 400], [100, 450], [1000, 450],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" className="hero-bg-dot" />
          ))}
        </g>
      </svg>
    </div>
  )
}

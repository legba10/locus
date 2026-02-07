"use client"

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BarChart3, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type Card = {
  title: string
  description: string
  icon: ReactNode
}

export function MarketAnalysisBlock({ className }: { className?: string }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reduce motion: show immediately (also fixes Safari edge cases)
    const reduceMotion = typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      : false

    if (reduceMotion) {
      setVisible(true)
      return
    }

    const el = rootRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cards: Card[] = [
    {
      title: 'Анализ цены',
      description: 'Сравниваем стоимость с рынком и показываем переплату',
      icon: <BarChart3 className="h-6 w-6 text-violet-600" aria-hidden="true" />,
    },
    {
      title: 'Проверка объявлений',
      description: 'Находим подозрительные варианты и предупреждаем',
      icon: <ShieldCheck className="h-6 w-6 text-violet-600" aria-hidden="true" />,
    },
    {
      title: 'AI‑подбор',
      description: 'Показываем варианты, которые подходят вам',
      icon: <Sparkles className="h-6 w-6 text-violet-600" aria-hidden="true" />,
    },
  ]

  return (
    <section
      ref={(node) => {
        rootRef.current = node
      }}
      className={cn('pt-[70px] pb-[60px]', className)}
      aria-label="LOCUS анализирует рынок"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-[26px] md:text-[32px] font-bold text-[#1C1F26] mb-3">
            LOCUS анализирует рынок за вас
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Мы проверяем объявления, сравниваем цены
            <br className="hidden sm:block" />
            и показываем только подходящие варианты
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {cards.map((card, idx) => (
            <div
              key={card.title}
              className={cn(
                'bg-white rounded-[18px] p-[26px]',
                'shadow-[0_20px_40px_rgba(0,0,0,0.06)]',
                'transition-all duration-[250ms] ease-out',
                'hover:-translate-y-[6px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]',
                'will-change-transform',
                'border border-gray-100/60',
                // reveal animation
                'transform-gpu',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
                'transition-[opacity,transform,box-shadow]'
              )}
              style={{
                transitionDuration: '400ms',
                transitionDelay: visible ? `${idx * 100}ms` : '0ms',
              }}
            >
              <div className="w-[46px] h-[46px] rounded-[12px] bg-[#F3F1FF] flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <h3 className="text-[18px] font-semibold text-[#1C1F26] mb-1.5">{card.title}</h3>
              <p className="text-[14px] text-[#6B7280] leading-[1.4]">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


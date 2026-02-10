'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface WelcomeScreenProps {
  onComplete?: () => void
  minDuration?: number
}

/**
 * WelcomeScreen — Экран загрузки LOCUS
 * 
 * Стиль:
 * - Логотип LOCUS
 * - Subtle glass background
 * - Текст загрузки на русском
 */
export function WelcomeScreen({ onComplete, minDuration = 2000 }: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Загрузка...')

  const loadingTexts = [
    'Загрузка...',
    'Анализируем лучшие варианты жилья...',
    'Подбираем рекомендации...',
    'Почти готово...',
  ]

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, minDuration / 50)

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingTexts.indexOf(prev)
        const nextIndex = (currentIndex + 1) % loadingTexts.length
        return loadingTexts[nextIndex]
      })
    }, minDuration / 4)

    const completeTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, minDuration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      clearTimeout(completeTimeout)
    }
  }, [minDuration, onComplete])

  return (
    <div className={cn(
      'fixed inset-0 z-50',
      'flex flex-col items-center justify-center',
      'bg-gradient-to-b from-gray-50 to-white'
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Glass Card */}
      <div className={cn(
        'relative',
        'bg-white/80 backdrop-blur-lg rounded-3xl',
        'shadow-2xl shadow-gray-200/50',
        'border border-white/50',
        'p-12 md:p-16',
        'text-center',
        'max-w-md mx-4'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-4xl font-bold text-blue-600">LOCUS</span>
        </div>

        {/* Tagline */}
        <p className="text-gray-600 mb-8">
          Умный поиск жилья
        </p>

        {/* Loading Indicator */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading Text */}
          <p className="text-sm text-gray-500 animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Bottom Text */}
      <p className="absolute bottom-8 text-sm text-gray-400">
        © {new Date().getFullYear()} LOCUS
      </p>
    </div>
  )
}

/**
 * PageLoader — Лоадер для страниц
 * Более компактный вариант для использования внутри страниц
 */
export function PageLoader({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 animate-pulse">
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}

/**
 * SkeletonCard — Скелетон для карточек
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  )
}

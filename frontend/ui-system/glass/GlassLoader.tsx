'use client'

import { cn } from '@/shared/utils/cn'
import { RU } from '@/core/i18n/ru'

interface GlassLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

/**
 * GlassLoader — Загрузчик в стиле LOCUS
 * 
 * С логотипом, liquid glass фоном, AI glow эффектом.
 */
export function GlassLoader({
  size = 'md',
  text,
  fullScreen = false,
  className,
}: GlassLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      className
    )}>
      {/* Logo with glow */}
      <div className="relative">
        {/* Glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          'bg-purple-500/30 blur-xl animate-pulse',
          sizeClasses[size]
        )} />
        
        {/* Spinner */}
        <div className={cn(
          'relative rounded-full',
          'border-2 border-white/20',
          'border-t-purple-500 border-r-blue-500',
          'animate-spin',
          sizeClasses[size]
        )} />
        
        {/* Center dot */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-2 h-2 rounded-full bg-white/80'
        )} />
      </div>
      
      {/* Text */}
      {text && (
        <p className="text-sm text-white/70 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
      )}>
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        
        {content}
      </div>
    )
  }

  return content
}

/**
 * LocusSplash — Загрузочный экран LOCUS
 * 
 * Используется при первой загрузке приложения.
 */
export function LocusSplash() {
  return (
    <div className={cn(
      'fixed inset-0 z-50',
      'flex flex-col items-center justify-center gap-6',
      'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
    )}>
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/15 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl animate-pulse delay-500" />
      </div>
      
      {/* Logo */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/50 to-purple-500/50 blur-2xl animate-pulse" />
        
        {/* Logo container */}
        <div className={cn(
          'relative px-8 py-4 rounded-2xl',
          'bg-white/[0.08] backdrop-blur-xl',
          'border border-white/[0.2]'
        )}>
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LOCUS
          </span>
        </div>
      </div>
      
      {/* Loader */}
      <GlassLoader size="md" />
      
      {/* Loading text */}
      <p className="text-white/60 text-sm animate-pulse">
        LOCUS анализирует данные...
      </p>
    </div>
  )
}

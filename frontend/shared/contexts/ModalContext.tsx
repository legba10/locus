'use client'

import * as React from 'react'

type ModalContextValue = {
  currentModalId: string | null
  /** Вернёт true, если слот занят этим модалом; иначе false (вторая модалка не открывается) */
  tryOpen: (id: string) => boolean
  close: (id: string) => void
}

const ModalContext = React.createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [currentModalId, setCurrentModalId] = React.useState<string | null>(null)
  const currentRef = React.useRef<string | null>(null)

  const tryOpen = React.useCallback((id: string): boolean => {
    if (currentRef.current !== null && currentRef.current !== id) return false
    currentRef.current = id
    setCurrentModalId(id)
    return true
  }, [])

  const close = React.useCallback((id: string) => {
    if (currentRef.current === id) {
      currentRef.current = null
      setCurrentModalId(null)
    }
  }, [])

  React.useEffect(() => {
    if (currentModalId) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [currentModalId])

  const value = React.useMemo(
    () => ({
      currentModalId,
      tryOpen,
      close,
    }),
    [currentModalId, tryOpen, close]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

/** TZ-4: хук для модалки — один слот глобально; вторая не открывается */
export function useModalLayer(id: string, open: boolean) {
  const ctx = React.useContext(ModalContext)

  React.useEffect(() => {
    if (!ctx) return
    if (open) ctx.tryOpen(id)
    return () => ctx.close(id)
  }, [open, id, ctx])

  return !ctx || ctx.currentModalId === id
}

export function useModalContext() {
  return React.useContext(ModalContext)
}

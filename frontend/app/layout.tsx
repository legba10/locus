import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Providers } from './providers'
import { HeaderLight } from '@/shared/ui/HeaderLight'
import { Footer } from '@/shared/ui/Footer'
import '../styles/globals.css'

const AiMascot = dynamic(() => import('@/components/mascot/AiMascot'), { ssr: false })

export const metadata: Metadata = {
  title: 'LOCUS — Поиск жилья',
  description: 'LOCUS помогает найти жильё и объясняет, почему оно вам подходит',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo-locus-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <HeaderLight />
            <main className="flex-1">{children}</main>
            <Footer />
            <AiMascot />
          </div>
        </Providers>
      </body>
    </html>
  )
}


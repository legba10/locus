import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Providers } from './providers'
import { Header } from '@/components/layout'
import { Footer } from '@/shared/ui/Footer'
import ThemeProvider from '@/providers/ThemeProvider'
import ErrorBoundaryWrapper from './ErrorBoundaryWrapper'
import ModalRoot from './ModalRoot'
import '../styles/globals.css'

const ReviewReminderPopup = dynamic(() => import('@/components/reviews/ReviewReminderPopup').then((m) => ({ default: m.ReviewReminderPopup })), { ssr: false })
const AppPreloader = dynamic(() => import('@/components/ui/AppPreloader').then((m) => ({ default: m.AppPreloader })), { ssr: false })

export const metadata: Metadata = {
  title: 'LOCUS — Поиск жилья',
  description: 'LOCUS помогает найти жильё и объясняет, почему оно вам подходит',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* ТЗ-1: 3 режима — light, dark, system. До гидрации выставляем data-theme по сохранённому или system */
  const themeInitScript = `
    (function () {
      try {
        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var resolved = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light');
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        root.setAttribute('data-theme', resolved);
        root.style.colorScheme = resolved;
      } catch (e) {}
    })();
  `;

  return (
    <html lang="ru" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/logo-icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <Providers>
            <ErrorBoundaryWrapper>
              <AppPreloader />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 main-with-header">{children}</main>
                <Footer />
                <ModalRoot />
                <ReviewReminderPopup />
              </div>
            </ErrorBoundaryWrapper>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}


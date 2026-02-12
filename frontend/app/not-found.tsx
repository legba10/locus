import Link from 'next/link'
import ErrorAnim from '@/components/lottie/ErrorAnim'

/**
 * Static 404 page — no providers, no requests.
 * Required for Vercel build (no prerender errors).
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #FAFAFC 0%, #F0F1F5 100%)' }}
    >
      <div className="mb-4">
        <ErrorAnim size={112} />
      </div>
      <h1 className="text-6xl font-bold text-[#1C1F26] mb-2">404</h1>
      <p className="text-[#6B7280] text-[18px] mb-8">Страница не найдена</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-[14px] bg-violet-600 text-white font-semibold text-[15px] hover:bg-violet-500 transition-colors"
      >
        На главную
      </Link>
    </div>
  )
}

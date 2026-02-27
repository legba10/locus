import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">
          Объявление не найдено
        </h2>
        <Link href="/listings" className="text-[var(--accent)] hover:opacity-90 text-[14px]">
          ← Вернуться к поиску
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'

const posts = [
  {
    id: 'safe-rent',
    title: 'Как снять жильё безопасно: чек‑лист арендатора',
    excerpt:
      'Проверяйте фото, описание, контактные данные и историю объекта. Не переводите деньги вне платформы.',
    date: 'Февраль 2026',
  },
  {
    id: 'landlord-analytics',
    title: 'Зачем арендодателю аналитика и как она помогает',
    excerpt:
      'Правильная цена и стабильный спрос зависят от рынка. Аналитика показывает, где вы теряете бронирования.',
    date: 'Февраль 2026',
  },
  {
    id: 'telegram-login',
    title: 'Вход через Telegram: почему это удобно и безопасно',
    excerpt:
      'Telegram позволяет подтвердить номер и ускорить вход, а LOCUS проверяет сессию по защищённому протоколу.',
    date: 'Февраль 2026',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Блог</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-500 mb-2">{post.date}</p>
              <h2 className="text-[16px] font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

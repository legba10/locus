'use client'

import Link from 'next/link'

const posts = [
  {
    id: 'safe-rent',
    title: 'Как снять жильё безопасно: чек‑лист арендатора',
    excerpt:
      'Сравните фото и описание, уточните условия, сохраните переписку. Выбирайте объявления с понятными правилами.',
    date: 'Февраль 2026',
    category: 'безопасность',
  },
  {
    id: 'landlord-analytics',
    title: 'Зачем арендодателю аналитика и как она помогает',
    excerpt:
      'Аналитика показывает, как конкуренты формируют цену и где вы теряете спрос. Это помогает быстрее находить арендаторов.',
    date: 'Февраль 2026',
    category: 'цены',
  },
  {
    id: 'telegram-login',
    title: 'Вход через Telegram: почему это удобно и безопасно',
    excerpt:
      'Подтверждение номера ускоряет вход и снижает риск фейков. LOCUS проверяет токены и обновляет доступ безопасно.',
    date: 'Февраль 2026',
    category: 'безопасность',
  },
  {
    id: 'listing-quality',
    title: 'Сильное объявление: как описывать жильё, чтобы быстрее сдавать',
    excerpt:
      'Чёткие условия, реальные фото и честное описание помогают получить больше запросов и меньше отказов.',
    date: 'Февраль 2026',
    category: 'советы',
  },
  {
    id: 'ai-selection',
    title: 'AI-подбор в аренде: как работает и где даёт выгоду',
    excerpt:
      'Алгоритмы учитывают параметры, сравнивают рынок и помогают сузить выбор без лишнего шума.',
    date: 'Февраль 2026',
    category: 'аренда',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Блог</h1>
        <div className="mb-6">
          <p className="text-[15px] text-gray-700 mb-3">Категории:</p>
          <div className="flex flex-wrap gap-2">
            {['аренда', 'цены', 'безопасность', 'советы'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] text-gray-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{post.date}</span>
                <span>•</span>
                <span className="uppercase tracking-wide">{post.category}</span>
              </div>
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

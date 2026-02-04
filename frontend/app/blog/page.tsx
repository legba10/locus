'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cn } from '@/shared/utils/cn'

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
  const [activeCategory, setActiveCategory] = useState('аренда')
  const categories = ['аренда', 'цены', 'безопасность', 'советы']
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => post.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 8h10M7 12h8M7 16h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Блог</h1>
            <p className="text-[15px] text-gray-700 mt-3">
              Практические материалы о рынке аренды, ценах, безопасности и AI‑подборе.
            </p>
            <p className="text-[13px] text-violet-600 mt-2">Аналитика рынка и безопасность с AI</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveCategory(item)}
              className={cn(
                'rounded-xl border p-4 text-[13px] uppercase tracking-wide text-center transition-all',
                activeCategory === item
                  ? 'border-violet-200 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              {item}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className={cn(
                'rounded-xl border border-gray-200 bg-white p-5 h-full',
                'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 16h-1v-4H8m1-4h4m-4 8h4m-2 0v2m0-10V6" />
                  </svg>
                </div>
              </div>
              <h2 className="text-[16px] font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-violet-50 border border-violet-100 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Почему это важно</h2>
          <p className="text-[15px] text-gray-700">
            AI и аналитика помогают понять рынок аренды, а практические советы сокращают риски.
            В блоге мы разбираем решения, которые действительно экономят время.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-gray-600">Хотите применить советы на практике?</p>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
          >
            Перейти к поиску
          </Link>
        </section>
      </div>
    </div>
  )
}

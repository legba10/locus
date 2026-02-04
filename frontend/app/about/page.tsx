'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6V4m0 2a6 6 0 100 12 6 6 0 000-12zm0 8a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">О LOCUS</h1>
            <p className="text-[15px] text-gray-700 mt-3">
              LOCUS — это платформа умной аренды с аналитикой, AI-подбором и фокусом на безопасность.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Проблема рынка', text: 'Фейки, завышенные цены и хаос в коммуникации мешают принять решение.' },
            { title: 'Решение LOCUS', text: 'AI-анализ, умный подбор и прозрачная логика бронирований.' },
            { title: 'Для кого', text: 'Арендаторы получают безопасность, арендодатели — аналитику и контроль.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 h-full">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-[14px] text-gray-700 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-violet-50 border border-violet-100 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Почему это важно</h2>
          <p className="text-[15px] text-gray-700">
            LOCUS помогает принимать решения на основе данных: сравнивает цену с рынком, подсвечивает риски и
            убирает сомнительные варианты. Это сокращает время поиска и повышает доверие к сервису.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-gray-600">LOCUS — не доска объявлений. Это инструмент принятия решений.</p>
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

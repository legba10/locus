'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">О LOCUS</h1>
          <p className="text-[15px] text-gray-700 mt-3">
            LOCUS — это платформа умной аренды с аналитикой, AI-подбором и фокусом на безопасность.
          </p>
        </div>

        <div className="space-y-8 text-[15px] text-gray-700 leading-relaxed">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Проблема рынка</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>рынок аренды перегружен фейками и сомнительными объявлениями;</li>
              <li>цены часто завышены без объяснимых причин;</li>
              <li>отсутствует аналитика, которая помогает оценить рынок;</li>
              <li>коммуникация хаотична и не даёт уверенности в результате.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Решение LOCUS</h2>
            <p className="mb-3">LOCUS решает проблему за счёт:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>AI-анализа объявлений и подсветки рисков;</li>
              <li>умного подбора жилья под запрос арендатора;</li>
              <li>аналитики для арендодателей и рекомендации по цене;</li>
              <li>прозрачной логики бронирований и коммуникации.</li>
            </ul>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Для арендаторов</h3>
              <p>Экономия времени, честные цены, безопасность и понятные условия аренды.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Для арендодателей</h3>
              <p>Аналитика, контроль, качество лидов и платная подписка для размещения.</p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Философия</h2>
            <p>LOCUS — не доска объявлений. Это инструмент принятия решений.</p>
          </section>
        </div>

        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

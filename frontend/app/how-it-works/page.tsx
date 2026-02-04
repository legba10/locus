'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Как это работает</h1>
            <p className="text-[15px] text-gray-700 mt-3">
              LOCUS объясняет логику поиска и подписки: меньше хаоса, больше решений на основе данных.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Шаг 1. Поиск', text: 'Фильтры и AI-подбор помогают быстро найти подходящие варианты.' },
            { title: 'Шаг 2. Анализ', text: 'Сравнение цены с рынком и выявление подозрений.' },
            { title: 'Шаг 3. Общение', text: 'Сообщения и бронирования в понятной логике.' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-5 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            >
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-[14px] text-gray-700 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-3">Для арендодателей (платно)</h2>
          <p className="text-[15px] text-gray-700 mb-4">
            Размещение и управление объявлениями доступно только при активном тарифе.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Публикация объявлений и управление карточками',
              'AI-анализ цены и рекомендации по улучшению',
              'Статистика просмотров и интереса арендаторов',
              'Управление бронированиями и сообщениями',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[14px] text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-violet-50 border border-violet-100 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Почему AI важен</h2>
          <p className="text-[15px] text-gray-700">
            AI анализирует рынок, снижает время поиска и повышает эффективность для обеих сторон.
            Это не “галочка”, а практичный помощник в принятии решений.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-gray-600">Готовы попробовать? Запустите AI-подбор или откройте тариф.</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/search?ai=true"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
            >
              Запустить AI‑подбор
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-[14px] font-semibold text-gray-800 hover:bg-gray-50"
            >
              Посмотреть тарифы
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

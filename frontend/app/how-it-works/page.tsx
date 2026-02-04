'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Как это работает</h1>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Для арендаторов</h2>
          <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Шаг 1. Поиск</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>фильтры по городу, бюджету, параметрам жилья;</li>
                <li>AI-подбор, который сокращает время на поиск.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Шаг 2. Анализ</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>сравнение цены с рынком;</li>
                <li>выявление подозрительных признаков в объявлении.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Шаг 3. Общение</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>сообщения внутри сервиса;</li>
                <li>бронирования с понятной логикой условий.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Для арендодателей (платно)</h2>
          <p className="text-[15px] text-gray-700 mb-4">
            Размещение и управление объявлениями доступно только при активном тарифе.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700 leading-relaxed">
            <li>публикация объявлений и управление карточками;</li>
            <li>AI-анализ цены и рекомендации по улучшению;</li>
            <li>статистика просмотров и интереса арендаторов;</li>
            <li>управление бронированиями и сообщениями.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Почему AI важен</h2>
          <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700 leading-relaxed">
            <li>AI анализирует рынок и помогает увидеть реальный уровень цены;</li>
            <li>снижает время поиска за счет более точного подбора;</li>
            <li>повышает эффективность как для арендатора, так и для арендодателя.</li>
          </ul>
        </section>

        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

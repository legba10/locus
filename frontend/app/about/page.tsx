'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">О LOCUS</h1>
        <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            LOCUS — сервис аренды жилья, который помогает принимать безопасные и взвешенные решения.
            Мы соединяем арендаторов и арендодателей на понятной платформе с прозрачными правилами.
          </p>
          <p>
            В отличие от классических площадок с хаотичными списками, мы делаем акцент на проверке,
            аналитике и полезных подсказках. Это снижает риск фейковых объявлений и экономит время.
          </p>
          <p>
            Для арендатора LOCUS — это точный поиск, фильтры по ключевым параметрам и подтверждение
            надежности объявления. Для арендодателя — понятный процесс размещения, тарифы, аналитика
            спроса и рекомендации по цене.
          </p>
          <p>
            Наша миссия — сделать рынок аренды прозрачным и безопасным, чтобы обе стороны
            были уверены в результате.
          </p>
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

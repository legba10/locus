'use client'

import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4l7 4v5c0 4.5-3 7-7 7s-7-2.5-7-7V8l7-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Безопасность</h1>
            <p className="text-[15px] text-gray-700 mt-3">
              LOCUS снижает риски и делает аренду предсказуемой — без обещаний «100%», но с прозрачной логикой.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Проверка объявлений', text: 'Автопроверки и модерация отсеивают сомнительные карточки.' },
            { title: 'Анализ цен', text: 'AI сравнивает цену с рынком и помогает видеть переплату.' },
            { title: 'Снижение фейков', text: 'Антифрод выявляет аномальные сценарии и снижает риск мошенничества.' },
            { title: 'История действий', text: 'История просмотров и бронирований помогает восстановить ход событий.' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-5 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            >
              <h2 className="text-[16px] font-semibold text-gray-900 mb-2">{item.title}</h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-violet-50 border border-violet-100 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Защита аккаунта</h2>
          <p className="text-[15px] text-gray-700">
            Токены доступа защищают сессию, а мы храним только необходимые данные. Если что-то вызывает
            сомнение — служба поддержки подскажет следующий шаг.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-gray-600">Хотите проверить варианты с AI?</p>
          <Link
            href="/search?ai=true"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
          >
            Попробовать AI
          </Link>
        </section>
      </div>
    </div>
  )
}

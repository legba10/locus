'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Как это работает</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Для арендатора</h2>
          <ul className="space-y-3 text-[15px] text-gray-700 leading-relaxed">
            <li>Поиск: выберите город, тип жилья и бюджет — система покажет подходящие варианты.</li>
            <li>Фильтры: уточняйте параметры по комнатам, цене и условиям.</li>
            <li>Бронирование: отправляйте заявку на проживание и фиксируйте условия.</li>
            <li>Безопасность: объявления проходят проверку и получают статус доверия.</li>
            <li>Защита от фейков: подозрительные карточки блокируются и не попадают в выдачу.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Для арендодателя</h2>
          <ul className="space-y-3 text-[15px] text-gray-700 leading-relaxed">
            <li>Размещение: создайте карточку объекта и добавьте реальные фото.</li>
            <li>Тарифы: выберите Landlord Basic или Pro для доступа к размещению.</li>
            <li>Аналитика: следите за спросом и эффективностью объявлений.</li>
            <li>Проверки: объявления проходят базовую модерацию и антифрод.</li>
            <li>Выгода: рекомендации по цене помогают увеличить загрузку.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Коротко о принципе</h3>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            LOCUS не просто показывает объявления — он помогает выбрать лучшее.
            Платформа объединяет понятный поиск, проверку объявлений и аналитику,
            чтобы решение было безопасным и прогнозируемым.
          </p>
        </section>

        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

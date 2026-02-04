'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Условия использования</h1>
        <div className="space-y-6 text-[15px] text-gray-700 leading-relaxed">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Общие положения</h2>
            <p>
              Используя сервис LOCUS, вы подтверждаете согласие с правилами платформы и обязуетесь
              соблюдать требования законодательства РФ. Пользователь отвечает за достоверность данных
              и контента, размещаемого на платформе.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Роли пользователей</h2>
            <p>
              Арендодатель отвечает за соответствие объявления реальному объекту и корректность условий.
              Арендатор обязуется соблюдать правила проживания и договоренности, указанные в объявлении.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Подписки и тарифы</h2>
            <p>
              Размещение и управление объявлениями доступны только при активном тарифе. Стоимость и
              условия подписок публикуются на странице тарифов и могут обновляться.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Ограничение ответственности</h2>
            <p>
              LOCUS обеспечивает техническую инфраструктуру и поддержку, но не является стороной
              договора аренды между пользователями и не несет ответственности за фактическое исполнение
              договоренностей сторон.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Обработка данных</h2>
            <p>
              Мы обрабатываем только необходимые данные для работы сервиса, соблюдаем требования
              законодательства и обеспечиваем разумные меры защиты информации.
            </p>
          </section>
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'

const FAQ = [
  {
    q: 'Как начать пользоваться',
    a: 'Выберите город и параметры жилья в поиске, включите AI-подбор и сохраните подходящие варианты. Для арендодателей размещение доступно только при активной подписке.',
  },
  {
    q: 'Почему не могу разместить объявление',
    a: 'Размещение и управление объявлениями доступны только при активном тарифе Landlord. Перейдите в тарифы и выберите план.',
  },
  {
    q: 'Как работает подписка',
    a: 'Подписка открывает размещение, аналитику, AI-анализ цены и управление бронированиями. Статус тарифа отображается в профиле.',
  },
  {
    q: 'Что делать, если не получается войти',
    a: 'Проверьте интернет и повторите вход. При входе через Telegram завершите авторизацию в боте и вернитесь на сайт. Если сессия истекла — выполните вход заново.',
  },
  {
    q: 'Вопросы по бронированиям',
    a: 'Проверьте статус бронирования в личном кабинете. Если нужны уточнения, используйте сообщения для связи с арендодателем.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 10h8M8 14h5M12 18a6 6 0 100-12 6 6 0 000 12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Помощь</h1>
            <p className="text-[15px] text-gray-700 mt-3">
              Короткие ответы на ключевые вопросы, чтобы вы быстро разобрались в сервисе.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5 h-full">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-2">{item.q}</h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-violet-50 border border-violet-100 p-6 md:p-8">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Почему это важно</h2>
          <p className="text-[15px] text-gray-700">
            LOCUS использует AI и аналитику, чтобы ускорить поиск и сделать логику подписки прозрачной.
            Если вопрос не решен — поддержка ответит и подскажет следующий шаг.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-gray-600">Нужен персональный ответ?</p>
          <Link
            href="/contacts"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
          >
            Связаться с поддержкой
          </Link>
        </section>
      </div>
    </div>
  )
}

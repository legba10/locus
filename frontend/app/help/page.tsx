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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Помощь</h1>
        <p className="text-[15px] text-gray-700 mb-6">
          Здесь собраны ответы на частые вопросы и рекомендации по работе с сервисом LOCUS.
        </p>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-2">{item.q}</h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <Link href="/contacts" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          Связаться с поддержкой →
        </Link>
      </div>
    </div>
  )
}

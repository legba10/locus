'use client'

import Link from 'next/link'

const FAQ = [
  {
    q: 'Не работает вход — что делать?',
    a: 'Проверьте интернет и повторите вход. Если используете Telegram, завершите авторизацию в боте и вернитесь на сайт. При ошибке “сессия истекла” выполните вход заново.',
  },
  {
    q: 'Не отображается тариф или права арендодателя',
    a: 'Выйдите из аккаунта и войдите снова. Данные подтягиваются из /auth/me. Если тариф только что изменили — обновление может занять несколько минут.',
  },
  {
    q: 'Почему нельзя разместить объявление?',
    a: 'Размещение доступно только на тарифах Landlord. Перейдите на страницу тарифов и выберите подходящий план.',
  },
  {
    q: 'Как связаться с поддержкой?',
    a: 'Напишите на support@locus.app или в Telegram: t.me/Locusrental.',
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

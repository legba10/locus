'use client'

import Link from 'next/link'

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Контакты</h1>
        <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            Служба поддержки LOCUS отвечает на вопросы арендаторов и арендодателей
            по работе сервиса, тарифам и безопасности.
          </p>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email поддержки</p>
              <a className="text-violet-600 hover:text-violet-700" href="mailto:support@locus.app">
                support@locus.app
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telegram</p>
              <a className="text-violet-600 hover:text-violet-700" href="https://t.me/Locusrental" target="_blank" rel="noreferrer">
                t.me/Locusrental
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">ВКонтакте</p>
              <a className="text-violet-600 hover:text-violet-700" href="https://vk.ru/club235775695" target="_blank" rel="noreferrer">
                vk.ru/club235775695
              </a>
            </div>
          </div>
          <p>
            Среднее время ответа — в течение рабочего дня. По срочным вопросам
            быстрее всего отвечаем в Telegram.
          </p>
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

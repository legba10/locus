'use client'

import Link from 'next/link'

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Контакты</h1>
        <div className="space-y-6 text-[15px] text-gray-700 leading-relaxed">
          <p>
            Служба поддержки LOCUS отвечает на вопросы арендаторов и арендодателей по работе сервиса,
            тарифам и безопасности.
          </p>

          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email поддержки</p>
              <a className="text-violet-600 hover:text-violet-700" href="mailto:support@locus.app">
                support@locus.app
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Телефон</p>
              <a className="text-violet-600 hover:text-violet-700" href="tel:+79224112141">
                +7 (922) 411-21-41
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telegram</p>
              <a className="text-violet-600 hover:text-violet-700" href="https://t.me/Locusrental" target="_blank" rel="noreferrer">
                https://t.me/Locusrental
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">ВКонтакте</p>
              <a className="text-violet-600 hover:text-violet-700" href="https://vk.ru/club235775695" target="_blank" rel="noreferrer">
                https://vk.ru/club235775695
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-4">Форма обратной связи</h2>
            <form className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Имя</label>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Сообщение</label>
                <textarea
                  placeholder="Опишите ваш вопрос или проблему"
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                Отправить
              </button>
            </form>
          </div>

          <p>Ответы предоставляются через поддержку LOCUS.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

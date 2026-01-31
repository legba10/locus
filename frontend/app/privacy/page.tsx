'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Политика конфиденциальности</h1>
        <div className="prose prose-gray text-gray-600 space-y-4">
          <p>Мы собираем только необходимые данные для работы сервиса: регистрация, объявления, бронирования.</p>
          <p>Данные не передаются третьим лицам в рекламных целях без вашего согласия.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

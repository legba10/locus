'use client'

import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Безопасность</h1>
        <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            Мы проверяем объявления и используем автоматические правила, чтобы снижать риск фейков.
            Подозрительные карточки блокируются и не попадают в выдачу.
          </p>
          <p>
            Данные пользователей защищены: сессии хранятся безопасно, а авторизация через Telegram
            проходит по проверенному протоколу. Мы не сохраняем лишние данные и не передаем их третьим лицам.
          </p>
          <p>
            Антифрод-система отслеживает аномальные действия и помогает предотвращать мошеннические сценарии.
            При выявлении риска объявление отправляется на дополнительную проверку.
          </p>
        </div>
        <Link href="/help" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          Перейти в помощь →
        </Link>
      </div>
    </div>
  )
}

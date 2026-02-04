'use client'

import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Безопасность</h1>
        <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Проверка объявлений</h2>
            <p>
              Мы проверяем объявления и используем автоматические правила, чтобы снижать риск фейков.
              Подозрительные карточки блокируются и не попадают в выдачу.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Анализ цен</h2>
            <p>
              AI и аналитика сравнивают цену с рынком, чтобы выявлять завышенные предложения и помогать
              пользователям принимать более обоснованные решения.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Снижение фейков</h2>
            <p>
              Антифрод-система отслеживает аномальные действия и помогает предотвращать мошеннические сценарии.
              При выявлении риска объявление отправляется на дополнительную проверку.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">История действий</h2>
            <p>
              История взаимодействий и бронирований помогает восстановить ход событий и решать вопросы
              с поддержкой быстрее.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Защита аккаунта</h2>
            <p>
              Авторизация проходит по проверенному протоколу, а токены используются только для доступа
              к вашему профилю. Мы сохраняем только необходимые данные и не обещаем 100% защиту,
              но постоянно улучшаем безопасность сервиса.
            </p>
          </section>
        </div>
        <Link href="/help" className="mt-8 inline-block text-violet-600 hover:text-violet-700">
          Перейти в помощь →
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export const dynamic = "force-dynamic";

export default function PricingPage({
  searchParams,
}: {
  searchParams?: { reason?: string }
}) {
  const reason = searchParams?.reason

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-[28px] md:text-[34px] font-bold text-[#1C1F26] mb-3">Тарифы LOCUS</h1>
          <p className="text-[15px] text-[#6B7280]">
            Выберите тариф для доступа к размещению объявлений и аналитике.
          </p>
          {reason === 'host' && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-violet-50 px-4 py-2 text-[13px] text-violet-700">
              Чтобы разместить объявление, нужен тариф Landlord.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 'free',
              title: 'Free',
              price: '0 ₽',
              features: [
                'Просмотр объявлений',
                'Бронирование',
                'Сообщения',
                '❌ Нельзя размещать объявления',
              ],
              accent: false,
            },
            {
              id: 'basic',
              title: 'Landlord Basic',
              price: '990 ₽/мес',
              features: [
                'Размещение объявлений',
                'Управление жильём',
                'Бронирования',
                'Сообщения',
                'Базовая аналитика',
              ],
              accent: true,
            },
            {
              id: 'pro',
              title: 'Landlord Pro',
              price: '1990 ₽/мес',
              features: [
                'Всё из Basic',
                'Расширенная аналитика',
                'Приоритет в выдаче',
                'AI-рекомендации',
              ],
              accent: false,
            },
          ].map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'rounded-[18px] p-6 border',
                plan.accent
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white border-gray-100'
              )}
            >
              <h2 className={cn('text-[18px] font-semibold mb-2', plan.accent ? 'text-white' : 'text-[#1C1F26]')}>
                {plan.title}
              </h2>
              <p className={cn('text-[24px] font-bold mb-4', plan.accent ? 'text-white' : 'text-[#1C1F26]')}>
                {plan.price}
              </p>
              <ul className={cn('text-[14px] space-y-2 mb-5', plan.accent ? 'text-white/90' : 'text-[#6B7280]')}>
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Link
                href={plan.id === 'free' ? '/listings' : '/pricing#cta'}
                className={cn(
                  'inline-flex items-center justify-center w-full px-4 py-2 rounded-[12px] text-[14px] font-medium',
                  plan.accent
                    ? 'bg-white text-violet-700 hover:bg-white/90'
                    : 'bg-violet-600 text-white hover:bg-violet-500'
                )}
              >
                {plan.id === 'free' ? 'Начать поиск' : 'Выбрать тариф'}
              </Link>
            </div>
          ))}
        </div>

        <div id="cta" className={cn(
          'mt-10 rounded-[18px] p-6 text-center',
          'bg-white border border-gray-100 shadow-[0_6px_24px_rgba(0,0,0,0.06)]'
        )}>
          <h3 className="text-[18px] font-bold text-[#1C1F26] mb-2">Готовы подключить тариф?</h3>
          <p className="text-[14px] text-[#6B7280] mb-4">
            Оставьте заявку на подключение тарифа — мы свяжемся с вами.
          </p>
          <a
            href="mailto:support@locus.app"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[12px] bg-violet-600 text-white text-[14px] font-medium hover:bg-violet-500"
          >
            Оставить заявку
          </a>
        </div>
      </div>
    </div>
  )
}

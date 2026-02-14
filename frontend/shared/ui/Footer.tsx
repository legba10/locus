import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { Logo } from './Logo'

/**
 * Footer — v3 Premium Product Footer
 * 
 * По ТЗ v3:
 * - 4 колонки равномерно
 * - Graphite gradient (НЕ blue): #0F172A → #020617
 * - Logo light variant, 32px, БЕЗ контейнера
 * - Телефон: +7 (922) 411-21-41
 * - Inner shadow: inset 0 1px 0 rgba(255,255,255,0.08)
 * - Vertical padding: 64px
 * - Column gap: 80px
 */
export function Footer({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear()

  const navigation = {
    platform: [
      { name: 'Поиск жилья', href: '/listings' },
      { name: 'Сдать жильё', href: '/pricing?reason=host' },
      { name: 'Как это работает', href: '/how-it-works' },
    ],
    company: [
      { name: 'О нас', href: '/about' },
      { name: 'Контакты', href: '/contacts' },
      { name: 'Блог', href: '/blog' },
    ],
    support: [
      { name: 'Помощь', href: '/help' },
      { name: 'Безопасность', href: '/safety' },
      { name: 'Условия', href: '/terms' },
    ],
  }

  return (
    <footer
      className={cn(className, 'footer-tz6 border-t border-[var(--border)]')}
    >
      <div className="market-container py-16 text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Logo variant="theme" size="lg" showText={true} className="mb-5" />
            <p className="text-[14px] text-[var(--sub)] leading-relaxed mb-5">
              Подбираем жильё под ваши параметры с персональными рекомендациями
            </p>
            <a
              href="tel:+79224112141"
              className="text-[15px] text-[var(--text)] font-medium hover:opacity-90 transition-all duration-200"
            >
              +7 (922) 411-21-41
            </a>
            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              <a 
                href="https://vk.ru/club235775695" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent1)] hover:text-white text-[var(--text)] flex items-center justify-center transition-all duration-200"
                aria-label="ВКонтакте"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.712-1.033-1.033-1.49-1.172-1.744-1.172-.358 0-.457.1-.457.584v1.56c0 .416-.133.666-1.229.666-1.812 0-3.816-1.097-5.228-3.14C4.285 10.666 3.857 8.1 3.857 7.577c0-.254.1-.49.584-.49h1.744c.436 0 .6.196.767.653.846 2.44 2.26 4.577 2.843 4.577.218 0 .318-.1.318-.648V9.313c-.066-1.166-.683-1.266-.683-1.683 0-.196.163-.393.423-.393h2.744c.37 0 .5.2.5.637v3.416c0 .37.165.5.27.5.217 0 .4-.13.806-.536 1.25-1.397 2.143-3.552 2.143-3.552.12-.254.313-.49.75-.49h1.744c.524 0 .64.27.524.636-.218 1.016-2.343 4.003-2.343 4.003-.186.3-.256.435 0 .77.186.254.793.77 1.2 1.24.744.86 1.315 1.587 1.468 2.086.164.5-.084.76-.598.76z"/>
                </svg>
              </a>
              <a 
                href="https://t.me/Locusrental" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent1)] hover:text-white text-[var(--text)] flex items-center justify-center transition-all duration-200"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Платформа */}
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">
              Платформа
            </h3>
            <ul className="space-y-3">
              {navigation.platform.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-[14px] text-[var(--sub)] hover:text-[var(--text)] transition-all duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Компания */}
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">
              Компания
            </h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-[14px] text-[var(--sub)] hover:text-[var(--text)] transition-all duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Помощь */}
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">
              Помощь
            </h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-[14px] text-[var(--sub)] hover:text-[var(--text)] transition-all duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--border)]">
        <div className="market-container py-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[14px] text-[var(--sub)]">
              © {currentYear} LOCUS. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-[14px] text-[var(--sub)] hover:text-[var(--text)] transition-all duration-200">
                Условия использования
              </Link>
              <Link href="/privacy" className="text-[14px] text-[var(--sub)] hover:text-[var(--text)] transition-all duration-200">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


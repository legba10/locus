# ТЗ-3: Полная переделка нижней навигации и кнопки добавить

## Статус: ✅ Выполнено

### Сделано

1. **Новый компонент** `components/navigation/BottomNav.tsx`
   - lucide-react: Home, Search, Plus, MessageCircle, User
   - Иконки size=22, Plus size=26
   - Ссылки: /, /listings, /profile/listings/create, /messages, /profile
   - Скрытие на admin, listing detail, chat

2. **Стили** `styles/bottomNav.css`
   - Glass: background rgba(10,15,25,0.65), backdrop-filter blur(20px)
   - border-top, padding-bottom: env(safe-area-inset-bottom)
   - Кнопки: width 60px, font 11px, color #8e9bb0, active #7a5cff
   - addButton: top -18px, 58x58, gradient, box-shadow (без glow/pulse)

3. **Интеграция**
   - layout.tsx: import BottomNav from @/components/navigation/BottomNav
   - globals.css: bottom-nav-tz53.css → bottomNav.css
   - layout index: удалён BottomNavGlobal

4. **Удалено**
   - Старый components/layout/BottomNav.tsx — оставлен (может использоваться), но layout использует новый
   - bottom-nav-tz53.css — заменён на bottomNav.css

### Результат

- ✔ кнопка ровно по центру
- ✔ нет пересвета (убраны glow, pulse)
- ✔ glass эффект
- ✔ safe-area iPhone (padding-bottom в nav)
- ✔ одинаковые иконки (22px, Plus 26px)
- ✔ кнопка выступает (top: -18px)

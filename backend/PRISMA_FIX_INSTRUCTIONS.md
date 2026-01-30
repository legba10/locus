# Инструкция по исправлению ошибки EPERM Prisma

## Текущая ситуация

Ошибка `EPERM: operation not permitted` возникает из-за того, что файлы Prisma заблокированы процессами Windows.

## ✅ РЕШЕНИЕ (Выберите один из вариантов)

### Вариант 1: Перезагрузка компьютера (САМЫЙ НАДЕЖНЫЙ)

1. **Сохраните всю работу**
2. **Перезагрузите компьютер**
3. После перезагрузки откройте терминал и выполните:
   ```powershell
   cd backend
   npm run prisma:fix-windows
   ```

### Вариант 2: Закрыть все процессы вручную

1. **Закройте все окна:**
   - VS Code / Cursor
   - Все терминалы
   - Prisma Studio (если открыт)
   - Браузер с открытым проектом

2. **Откройте Диспетчер задач (Ctrl+Shift+Esc)**
   - Найдите все процессы `node.exe`
   - Завершите их все

3. **Подождите 10 секунд**

4. **Выполните:**
   ```powershell
   cd backend
   npm run prisma:fix-windows
   ```

### Вариант 3: Запуск от имени администратора

1. **Закройте все процессы Node.js**

2. **Откройте PowerShell от имени администратора:**
   - Правый клик на PowerShell → "Запуск от имени администратора"

3. **Выполните:**
   ```powershell
   cd C:\Users\surgu\locus\locus-new\backend
   npm run prisma:fix-windows
   ```

### Вариант 4: Удалить node_modules полностью

⚠️ **Это займет время на переустановку пакетов**

```powershell
cd backend
Remove-Item -Path "node_modules" -Recurse -Force
npm install
npx prisma generate
```

## После успешной генерации

Проверьте, что все работает:

```powershell
# Проверка наличия Prisma Client
Test-Path "node_modules\.prisma\client\index.js"
# Должно вернуть: True

# Запуск backend
npm run dev
```

## Почему это происходит?

Windows блокирует файлы `.dll.node`, когда они используются процессами. Prisma пытается переименовать временный файл в финальный, но Windows не позволяет это сделать.

**Решение:** Освободить файлы, закрыв все процессы, или перезагрузить систему.

## Профилактика

В будущем, перед `prisma generate`:
1. Закрывайте Prisma Studio
2. Закрывайте IDE
3. Используйте скрипт `npm run prisma:fix-windows`

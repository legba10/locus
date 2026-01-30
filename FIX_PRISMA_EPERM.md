# Исправление ошибки EPERM Prisma на Windows

## Проблема

При выполнении `npx prisma generate` на Windows возникает ошибка:
```
EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...' -> '...query_engine-windows.dll.node'
```

Это происходит, когда файл Prisma Client заблокирован другим процессом.

## Решение 1: Использовать скрипт (Рекомендуется)

### PowerShell
```powershell
cd backend
npm run prisma:fix-windows
```

Или напрямую:
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File fix-prisma-windows.ps1
```

### CMD/Batch
```cmd
cd backend
fix-prisma-windows.bat
```

## Решение 2: Ручное исправление

### Шаг 1: Закрыть все процессы
1. Закройте все окна IDE (VS Code, Cursor)
2. Закройте Prisma Studio (если открыт)
3. Закройте все терминалы
4. Проверьте процессы Node.js:
   ```powershell
   Get-Process -Name node
   ```
   Если есть процессы, закройте их:
   ```powershell
   Stop-Process -Name node -Force
   ```

### Шаг 2: Удалить заблокированные файлы
```powershell
cd backend
Remove-Item -Path "node_modules\.prisma" -Recurse -Force
```

### Шаг 3: Очистить кэш
```powershell
npm cache clean --force
```

### Шаг 4: Перегенерировать с флагом --force
```powershell
npx prisma generate --force
```

## Решение 3: Если ничего не помогает (РЕКОМЕНДУЕТСЯ)

1. **Перезагрузите компьютер** - это освободит все заблокированные файлы
2. После перезагрузки выполните:
   ```powershell
   cd backend
   npm run prisma:fix-windows
   ```

**Важно:** Перезагрузка - самый надежный способ решить проблему EPERM на Windows.

## Решение 4: Альтернативный метод

Если проблема повторяется, попробуйте удалить весь `node_modules`:

```powershell
cd backend
Remove-Item -Path "node_modules" -Recurse -Force
npm install
npx prisma generate --force
```

## Профилактика

Чтобы избежать этой проблемы в будущем:

1. **Всегда закрывайте Prisma Studio** перед генерацией
2. **Закрывайте IDE** перед выполнением `prisma generate`
3. **Используйте флаг `--force`** при генерации:
   ```powershell
   npx prisma generate --force
   ```

## Проверка

После успешной генерации проверьте:

```powershell
# Проверка наличия Prisma Client
Test-Path "node_modules\.prisma\client\index.js"

# Должно вернуть: True
```

## Дополнительная информация

Эта ошибка характерна для Windows из-за того, как Windows обрабатывает блокировку файлов. Prisma пытается переименовать временный файл в финальный, но Windows не позволяет это сделать, если файл используется другим процессом.

**Примечание:** Если вы используете WSL (Windows Subsystem for Linux), попробуйте выполнить команды там - обычно проблем с EPERM там не возникает.

# Скрипт для исправления ошибки EPERM Prisma на Windows

Write-Host "Исправление ошибки EPERM Prisma..." -ForegroundColor Yellow

# Шаг 1: Закрыть все процессы Node.js
Write-Host "`n1. Закрытие процессов Node.js..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Шаг 2: Удалить заблокированные файлы Prisma
Write-Host "2. Удаление заблокированных файлов Prisma..." -ForegroundColor Cyan
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    Remove-Item -Path $prismaPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Удалено" -ForegroundColor Green
} else {
    Write-Host "   ✓ Папка не найдена" -ForegroundColor Green
}

# Шаг 3: Очистить кэш npm
Write-Host "3. Очистка кэша npm..." -ForegroundColor Cyan
npm cache clean --force 2>$null
Write-Host "   ✓ Кэш очищен" -ForegroundColor Green

# Шаг 4: Перегенерировать Prisma Client
Write-Host "`n4. Генерация Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Prisma Client успешно сгенерирован!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Ошибка при генерации. Попробуйте:" -ForegroundColor Red
    Write-Host "  1. Закройте все окна IDE (VS Code, Cursor)" -ForegroundColor Yellow
    Write-Host "  2. Закройте Prisma Studio (если открыт)" -ForegroundColor Yellow
    Write-Host "  3. Перезагрузите компьютер" -ForegroundColor Yellow
    Write-Host "  4. Запустите скрипт снова" -ForegroundColor Yellow
}

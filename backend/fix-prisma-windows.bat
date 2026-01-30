@echo off
echo Исправление ошибки EPERM Prisma на Windows...
echo.

echo 1. Закрытие процессов Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. Удаление заблокированных файлов Prisma...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma" 2>nul
    echo    ✓ Удалено
) else (
    echo    ✓ Папка не найдена
)

echo 3. Очистка кэша npm...
call npm cache clean --force >nul 2>&1
echo    ✓ Кэш очищен

echo.
echo 4. Генерация Prisma Client...
call npx prisma generate --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Prisma Client успешно сгенерирован!
) else (
    echo.
    echo ✗ Ошибка при генерации. Попробуйте:
    echo   1. Закройте все окна IDE (VS Code, Cursor)
    echo   2. Закройте Prisma Studio (если открыт)
    echo   3. Перезагрузите компьютер
    echo   4. Запустите скрипт снова
)

pause

# Рабочий скрипт для установки better-sqlite3 с использованием глобальной версии node-gyp

Write-Host "Установка зависимостей..." -ForegroundColor Cyan

$vsPath = "D:\VisualStudio"
$vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
$projectPath = $PWD.Path

# Установка express (не требует компиляции)
Write-Host "Установка express..." -ForegroundColor Yellow
npm install express

# Установка better-sqlite3 через глобальную версию node-gyp
Write-Host "Установка better-sqlite3..." -ForegroundColor Yellow

# Создаем временный batch-файл
$batchScript = @"
@echo off
call "$vcvarsPath" >nul 2>&1
cd /d "$projectPath"
echo Установка better-sqlite3...
npm install better-sqlite3 --ignore-scripts
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
cd node_modules\better-sqlite3
echo Компиляция better-sqlite3...
node-gyp rebuild --release
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Установка завершена успешно!
) else (
    echo.
    echo Ошибка при компиляции.
    exit /b %ERRORLEVEL%
)
"@

$tempBatch = Join-Path $env:TEMP "install-better-sqlite3-$(Get-Random).bat"
$batchScript | Out-File -FilePath $tempBatch -Encoding ASCII -NoNewline

Write-Host "Запуск компиляции..." -ForegroundColor Cyan
& cmd.exe /c $tempBatch

$exitCode = $LASTEXITCODE
Remove-Item $tempBatch -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "Установка завершена успешно!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Ошибка при установке. Код выхода: $exitCode" -ForegroundColor Red
    exit $exitCode
}

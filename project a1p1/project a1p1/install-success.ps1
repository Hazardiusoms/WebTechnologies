# Финальный рабочий скрипт для установки зависимостей

Write-Host "Установка зависимостей проекта..." -ForegroundColor Cyan

$vsPath = "D:\VisualStudio"
$vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
$projectPath = $PWD.Path

# Установка express (не требует компиляции)
Write-Host "Установка express..." -ForegroundColor Yellow
npm install express

# Установка better-sqlite3 без компиляции
Write-Host "Установка better-sqlite3 (без компиляции)..." -ForegroundColor Yellow
npm install better-sqlite3 --ignore-scripts

# Компиляция better-sqlite3 вручную с использованием глобальной версии node-gyp
Write-Host "Компиляция better-sqlite3..." -ForegroundColor Yellow

$batchScript = @"
@echo off
call "$vcvarsPath" >nul 2>&1
cd /d "$projectPath\node_modules\better-sqlite3"
set VCINSTALLDIR=$vsPath\VC\
set npm_config_msvs_version=
node-gyp rebuild --release
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Компиляция завершена успешно!
) else (
    echo.
    echo Ошибка при компиляции.
    exit /b %ERRORLEVEL%
)
"@

$tempBatch = Join-Path $env:TEMP "compile-better-sqlite3-$(Get-Random).bat"
$batchScript | Out-File -FilePath $tempBatch -Encoding ASCII -NoNewline

& cmd.exe /c $tempBatch

$exitCode = $LASTEXITCODE
Remove-Item $tempBatch -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Установка завершена успешно!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Проверка установки..." -ForegroundColor Cyan
    node -e "const Database = require('better-sqlite3'); console.log('✓ better-sqlite3 работает корректно!');"
} else {
    Write-Host ""
    Write-Host "Ошибка при установке. Код выхода: $exitCode" -ForegroundColor Red
    exit $exitCode
}

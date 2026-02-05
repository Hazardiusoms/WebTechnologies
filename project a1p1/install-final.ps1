# Финальный скрипт для установки зависимостей через Developer Command Prompt

Write-Host "Установка зависимостей через Developer Command Prompt..." -ForegroundColor Cyan

$vsPath = "D:\VisualStudio"
$vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
$projectPath = $PWD.Path

if (Test-Path $vcvarsPath) {
    Write-Host "Найден vcvars64.bat: $vcvarsPath" -ForegroundColor Green
    
    # Создаем batch-файл для установки
    $batchScript = @"
@echo off
call "$vcvarsPath" >nul 2>&1
cd /d "$projectPath"
echo Установка зависимостей npm...
npm install
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Установка завершена успешно!
) else (
    echo.
    echo Ошибка при установке зависимостей.
    exit /b %ERRORLEVEL%
)
"@
    
    $tempBatch = Join-Path $env:TEMP "install-deps-$(Get-Random).bat"
    $batchScript | Out-File -FilePath $tempBatch -Encoding ASCII -NoNewline
    
    Write-Host "Запуск установки..." -ForegroundColor Cyan
    Write-Host ""
    
    # Запускаем через cmd.exe с сохранением вывода
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
} else {
    Write-Host "Ошибка: vcvars64.bat не найден в $vsPath" -ForegroundColor Red
    exit 1
}

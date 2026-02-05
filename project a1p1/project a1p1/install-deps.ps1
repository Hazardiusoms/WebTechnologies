# Скрипт для установки зависимостей с использованием Visual Studio на диске D

Write-Host "Проверка установки Visual Studio на диске D..." -ForegroundColor Cyan

$vsPath = "D:\VisualStudio"
$vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"

if (Test-Path $vcvarsPath) {
    Write-Host "Найден компилятор C++ в $vsPath" -ForegroundColor Green
    Write-Host "Настройка переменных окружения..." -ForegroundColor Cyan
    
    # Настройка переменных окружения для node-gyp
    $env:VCINSTALLDIR = "$vsPath\VC\"
    
    # Поиск версии MSVC
    $msvcPath = Get-ChildItem "$vsPath\VC\Tools\MSVC" -Directory -ErrorAction SilentlyContinue | 
        Sort-Object Name -Descending | 
        Select-Object -First 1
    
    if ($msvcPath) {
        $env:VCToolsInstallDir = $msvcPath.FullName + "\"
        Write-Host "Найден MSVC: $($msvcPath.FullName)" -ForegroundColor Green
    }
    
    # Установка зависимостей
    Write-Host "Установка зависимостей npm..." -ForegroundColor Cyan
    npm install
    
} else {
    Write-Host "Компилятор C++ не найден в $vsPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Необходимо установить рабочую нагрузку 'Desktop development with C++':" -ForegroundColor Yellow
    Write-Host "1. Откройте Visual Studio Installer" -ForegroundColor Yellow
    Write-Host "2. Найдите Visual Studio Build Tools" -ForegroundColor Yellow
    Write-Host "3. Нажмите 'Изменить' (Modify)" -ForegroundColor Yellow
    Write-Host "4. Выберите 'Desktop development with C++'" -ForegroundColor Yellow
    Write-Host "5. Убедитесь, что выбраны:" -ForegroundColor Yellow
    Write-Host "   - MSVC v143 - VS 2022 C++ x64/x86 build tools" -ForegroundColor Yellow
    Write-Host "   - Windows 10/11 SDK" -ForegroundColor Yellow
    Write-Host "6. Нажмите 'Изменить' и дождитесь установки" -ForegroundColor Yellow
    Write-Host "7. Перезапустите терминал и запустите этот скрипт снова" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Попытка установки без компиляции (может не сработать)..." -ForegroundColor Yellow
    npm install --build-from-source=false better-sqlite3
}

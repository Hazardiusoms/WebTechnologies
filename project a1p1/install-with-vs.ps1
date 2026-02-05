# Скрипт для установки зависимостей с настройкой переменных окружения для Visual Studio на диске D

Write-Host "Настройка переменных окружения для Visual Studio..." -ForegroundColor Cyan

$vsPath = "D:\VisualStudio"
$msvcVersion = "14.50.35717"
$msvcPath = "$vsPath\VC\Tools\MSVC\$msvcVersion"

# Проверка наличия компилятора
if (-not (Test-Path "$msvcPath\bin\Hostx64\x64\cl.exe")) {
    Write-Host "Поиск последней версии MSVC..." -ForegroundColor Yellow
    $msvcPath = Get-ChildItem "$vsPath\VC\Tools\MSVC" -Directory | 
        Sort-Object Name -Descending | 
        Select-Object -First 1 | 
        ForEach-Object { $_.FullName }
    $msvcVersion = Split-Path $msvcPath -Leaf
    Write-Host "Найдена версия MSVC: $msvcVersion" -ForegroundColor Green
}

if (Test-Path "$msvcPath\bin\Hostx64\x64\cl.exe") {
    Write-Host "Компилятор найден: $msvcPath" -ForegroundColor Green
    
    $vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
    
    if (Test-Path $vcvarsPath) {
        Write-Host "Использование vcvars64.bat для настройки окружения..." -ForegroundColor Cyan
        
        # Создаем временный batch-файл для установки
        $batchScript = @"
@echo off
call "$vcvarsPath"
cd /d "$PWD"
npm install
"@
        
        $tempBatch = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.bat'
        $batchScript | Out-File -FilePath $tempBatch -Encoding ASCII
        
        Write-Host "Запуск установки через Developer Command Prompt..." -ForegroundColor Cyan
        & cmd.exe /c $tempBatch
        
        Remove-Item $tempBatch -ErrorAction SilentlyContinue
    } else {
        Write-Host "Ошибка: vcvars64.bat не найден" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "Ошибка: Компилятор не найден в $msvcPath" -ForegroundColor Red
    exit 1
}

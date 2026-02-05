# Настройка Visual Studio Build Tools для better-sqlite3

## Проблема
При установке `better-sqlite3` возникает ошибка, что node-gyp не может найти Visual Studio для компиляции нативных модулей.

## Решение

### Вариант 1: Установить рабочую нагрузку "Desktop development with C++" (Рекомендуется)

1. Откройте **Visual Studio Installer** (найдите в меню Пуск)
2. Найдите установленные **Visual Studio Build Tools**
3. Нажмите **Изменить** (Modify)
4. В разделе **Рабочие нагрузки** (Workloads) выберите:
   - ✅ **Desktop development with C++** (Разработка классических приложений на C++)
5. В правой панели убедитесь, что выбраны:
   - ✅ **MSVC v143 - VS 2022 C++ x64/x86 build tools** (или последняя версия)
   - ✅ **Windows 10/11 SDK** (последняя версия)
6. Нажмите **Изменить** и дождитесь завершения установки
7. После установки **перезапустите терминал/PowerShell**
8. Выполните: `npm install`

### Вариант 2: Использовать Developer Command Prompt

Если рабочая нагрузка уже установлена, но переменные окружения не настроены:

1. Найдите в меню Пуск: **Developer Command Prompt for VS** или **x64 Native Tools Command Prompt for VS**
2. Откройте его
3. Перейдите в папку проекта:
   ```
   cd "c:\Users\nuska\Downloads\Telegram Desktop\project a1p1\project a1p1"
   ```
4. Выполните: `npm install`

### Вариант 3: Настроить переменные окружения вручную

Если вы знаете путь к установке Visual Studio, можно настроить переменные окружения:

```powershell
# Найдите путь к установке (обычно что-то вроде):
# C:\Program Files\Microsoft Visual Studio\2022\BuildTools

# Установите переменные окружения:
$env:VCINSTALLDIR = "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\"
$env:VCToolsInstallDir = "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\<версия>\"
```

### Проверка установки

После установки рабочей нагрузки проверьте:

```powershell
& "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
```

Если команда возвращает путь (не пусто), значит компоненты установлены правильно.

## Альтернативное решение (если ничего не помогает)

Если установка рабочей нагрузки не помогает, можно попробовать использовать предсобранные бинарники:

```bash
npm install --build-from-source=false better-sqlite3
```

**Примечание:** Это может не сработать для новых версий Node.js, так как предсобранные бинарники могут быть недоступны.

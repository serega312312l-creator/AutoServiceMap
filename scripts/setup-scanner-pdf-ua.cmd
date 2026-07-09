@echo off
REM СКАНЕР PDF UA — повне налаштування (Cursor Cloud + lint + EAS)
set "APP_PATH=C:\Users\Laptoper USA\Projects\skanerpdfua"
if not exist "%APP_PATH%" (
  echo Папка не знайдена: %APP_PATH%
  exit /b 1
)
cd /d "%~dp0.."
node scripts\bootstrap-sibling-app.mjs "%APP_PATH%" scanner-pdf-ua com.scannerpdfua.app "Scanner PDF UA"
call scripts\finish-scanner-pdf-ua.cmd
exit /b %ERRORLEVEL%

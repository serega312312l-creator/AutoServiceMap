@echo off
set "APP_PATH=C:\Users\Laptoper USA\Projects\skanerpdfua"
cd /d "%~dp0.."
if not exist "%APP_PATH%" (
  echo Папка не знайдена: %APP_PATH%
  exit /b 1
)
node scripts\finish-scanner-pdf-ua.mjs "%APP_PATH%" %*
exit /b %ERRORLEVEL%

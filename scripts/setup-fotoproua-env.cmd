@echo off
REM Копіює config/env.js і підключає envFirst у app.config.js (ФОТО PRO UA)
set "APP_PATH=C:\Users\Laptoper USA\Projects\FotoProUA"
set "ROOT=%~dp0.."
if not exist "%APP_PATH%\app.config.js" (
  echo Немає app.config.js у %APP_PATH%
  exit /b 1
)
if not exist "%APP_PATH%\config" mkdir "%APP_PATH%\config"
copy /Y "%ROOT%\templates\foto-pro-ua\config\env.js" "%APP_PATH%\config\env.js" >nul
if not exist "%APP_PATH%\scripts" mkdir "%APP_PATH%\scripts"
copy /Y "%ROOT%\templates\foto-pro-ua\integrate-cursor-env.mjs" "%APP_PATH%\scripts\integrate-cursor-env.mjs" >nul
cd /d "%APP_PATH%"
node scripts\integrate-cursor-env.mjs
echo.
echo Готово: config\env.js + envFirst у app.config.js
exit /b %ERRORLEVEL%

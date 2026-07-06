@echo off
cd /d "%~dp0.."
if "%CURSOR_API_KEY%"=="" (
  echo.
  echo Потрібен ключ: Dashboard -^> API Keys -^> Create
  echo   set CURSOR_API_KEY=ваш_ключ
  echo   scripts\setup-cursor-cloud.cmd
  echo.
  exit /b 1
)
node scripts/setup-cursor-cloud.mjs
exit /b %ERRORLEVEL%

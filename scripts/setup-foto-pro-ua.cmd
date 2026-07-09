@echo off
REM ФОТО PRO UA — Cursor Cloud як AVTOGID
REM Змініть шлях, якщо папка інша:
set "APP_PATH=C:\Users\Laptoper USA\Projects\FotoProUA"
cd /d "%~dp0.."
node scripts/bootstrap-sibling-app.mjs "%APP_PATH%" foto-pro-ua com.fotoproua.app "ФОТО PRO UA"
exit /b %ERRORLEVEL%

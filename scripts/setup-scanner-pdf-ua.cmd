@echo off
REM СКАНЕР PDF UA — Cursor Cloud як AVTOGID
REM Змініть шлях, якщо папка інша:
set "APP_PATH=C:\Users\Laptoper USA\Projects\ScannerPdfUA"
cd /d "%~dp0.."
node scripts/bootstrap-sibling-app.mjs "%APP_PATH%" scanner-pdf-ua com.scannerpdfua.app "СКАНЕР PDF UA"
exit /b %ERRORLEVEL%

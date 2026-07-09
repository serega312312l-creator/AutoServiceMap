@echo off
REM СКАНЕР PDF UA — Cursor Cloud як AVTOGID
REM Змініть APP_PATH на реальну папку (див. dir нижче)
set "APP_PATH=C:\Users\Laptoper USA\Projects\SkanerPdfUA"
if not exist "%APP_PATH%" set "APP_PATH=C:\Users\Laptoper USA\Projects\PDFScannerUA"
if not exist "%APP_PATH%" set "APP_PATH=C:\Users\Laptoper USA\Projects\ScannerPDF"
if not exist "%APP_PATH%" (
  echo.
  echo Папку СКАНЕР PDF UA не знайдено. Перевірте шлях:
  echo   dir /b "C:\Users\Laptoper USA\Projects"
  echo.
  echo Потім відредагуйте APP_PATH у scripts\setup-scanner-pdf-ua.cmd
  echo або запустіть вручну:
  echo   node scripts\bootstrap-sibling-app.mjs "ШЛЯХ" scanner-pdf-ua com.scannerpdfua.app "СКАНЕР PDF UA"
  echo.
  exit /b 1
)
cd /d "%~dp0.."
node scripts/bootstrap-sibling-app.mjs "%APP_PATH%" scanner-pdf-ua com.scannerpdfua.app "СКАНЕР PDF UA"
exit /b %ERRORLEVEL%

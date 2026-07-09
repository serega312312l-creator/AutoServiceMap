@echo off
set "APP_PATH=C:\Users\Laptoper USA\Projects\FotoProUA"
cd /d "%~dp0.."
node scripts\finish-fotoproua-lint.mjs "%APP_PATH%"
exit /b %ERRORLEVEL%

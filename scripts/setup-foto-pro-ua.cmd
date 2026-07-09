@echo off
REM ФОТО PRO UA — Cursor Cloud як AVTOGID
set "APP_PATH=C:\Users\Laptoper USA\Projects\FotoProUA"
cd /d "%~dp0.."
node scripts/bootstrap-sibling-app.mjs "%APP_PATH%" foto-pro-ua com.fotoproua.app "FotoProUA"
call scripts\setup-fotoproua-env.cmd
echo.
echo Далі: git add . ^&^& git commit ^&^& git push  (у папці FotoProUA)
exit /b %ERRORLEVEL%

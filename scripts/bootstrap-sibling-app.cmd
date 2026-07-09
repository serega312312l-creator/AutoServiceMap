@echo off
cd /d "%~dp0.."
node scripts/bootstrap-sibling-app.mjs %*
exit /b %ERRORLEVEL%

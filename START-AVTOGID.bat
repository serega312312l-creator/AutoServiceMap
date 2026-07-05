@echo off
title AVTOGID - Server
cd /d "C:\Users\Laptoper USA\Projects\AutoServiceMap"
echo.
echo ========================================
echo   AVTOGID - ne zakrivajte ce vikno!
echo ========================================
echo.
"C:\Program Files\nodejs\npx.cmd" expo start --port 8085 --lan
pause

@echo off
chcp 65001 >nul
title VoltKart — Stopping Services...

echo.
echo ======================================================================
echo   Stopping all VoltKart Node.js processes...
echo ======================================================================
echo.

taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] All Node.js services successfully stopped.
) else (
    echo [INFO] No running Node.js processes found.
)

echo.
pause
exit /b 0

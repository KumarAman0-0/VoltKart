@echo off
chcp 65001 >nul
title VoltKart — Launching All Services...

echo.
echo ======================================================================
echo   VoltKart 1-Click Multi-Service Launcher
echo ======================================================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH!
    pause
    exit /b 1
)

echo [1/6] Launching Backend Server (API & WebSockets) on Port 5000...
start "VoltKart [1/6] - Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Small delay to let Backend and MongoDB start
timeout /t 3 /nobreak >nul

echo [2/6] Launching Consumer Web Marketplace on Port 5173...
start "VoltKart [2/6] - Consumer Web (Port 5173)" cmd /k "cd /d "%~dp0apps\consumer-web" && npm run dev"

echo [3/6] Launching Field Agent Mobile App on Port 5174...
start "VoltKart [3/6] - Agent Mobile App (Port 5174)" cmd /k "cd /d "%~dp0apps\agent-mobile-app" && npm run dev"

echo [4/6] Launching Zero-Install Diagnostic PWA on Port 5175...
start "VoltKart [4/6] - Diagnostic PWA (Port 5175)" cmd /k "cd /d "%~dp0apps\diagnostic-pwa" && npm run dev"

echo [5/6] Launching Warehouse Engineer & OS Flasher Portal on Port 5176...
start "VoltKart [5/6] - Warehouse Portal (Port 5176)" cmd /k "cd /d "%~dp0apps\warehouse-portal" && npm run dev"

echo [6/6] Launching Super Admin Operations Console on Port 5177...
start "VoltKart [6/6] - Admin Portal (Port 5177)" cmd /k "cd /d "%~dp0apps\admin-portal" && npm run dev"

echo.
echo ======================================================================
echo  All 6 VoltKart services have been launched!
echo.
echo  Backend Server:    http://localhost:5000
echo  Consumer Web:      http://localhost:5173
echo  Agent Mobile App:  http://localhost:5174
echo  Diagnostic PWA:    http://localhost:5175
echo  Warehouse Portal:  http://localhost:5176
echo  Admin Console:     http://localhost:5177
echo ======================================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173
exit /b 0

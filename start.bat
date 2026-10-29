@echo off
chcp 65001 >nul
title VoltKart — Privacy-OS Refurbished Marketplace Ecosystem Launcher
color 0b

echo.
echo  ======================================================================
echo    __     __    _ _   _  __           _   
echo    \ \   / /__ | | |_| |/ /__ _ _ __ | |_ 
echo     \ \ / / _ \| | __| ' // _` | '__|| __|
echo      \ V / (_) | | |_| . \ (_| | |   | |_ 
echo       \_/ \___/|_|\__|_|\_\__,_|_|    \__|
echo.
echo    VoltKart — Privacy-OS Refurbished Marketplace Ecosystem
echo  ======================================================================
echo.

:: 1. Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo Please download and install Node.js (v18 or higher) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in your system PATH!
    pause
    exit /b 1
)

echo [OK] Node.js and npm verified.
echo.
echo Select an option to start:
echo.
echo   [1] Start All 6 Services (Dedicated Terminals - Recommended)
echo   [2] Start All Services (Single Unified Console via Concurrently)
echo   [3] Seed Database with Sample Inventory, Test Accounts & Rules
echo   [4] Install / Update Dependencies for All Apps & Server
echo   [5] Stop All Running VoltKart / Node.js Processes
echo   [6] Exit
echo.
set /p choice="Enter your choice [1-6] (Default is 1): "

if "%choice%"=="" set choice=1
if "%choice%"=="1" goto start_all_windows
if "%choice%"=="2" goto start_unified
if "%choice%"=="3" goto seed_db
if "%choice%"=="4" goto install_all
if "%choice%"=="5" goto stop_all
if "%choice%"=="6" goto end

echo Invalid option selected. Starting all services by default...
goto start_all_windows

:start_all_windows
echo.
echo ======================================================================
echo  Launching all VoltKart services in dedicated windows...
echo ======================================================================
echo.

echo [1/6] Launching Backend Server (API & WebSockets) on Port 5000...
start "VoltKart [1/6] - Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Small delay to allow MongoDB / Server initialization
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

goto show_status

:start_unified
echo.
echo ======================================================================
echo  Starting all 6 services in unified console (concurrently)...
echo ======================================================================
echo.
cd /d "%~dp0"
npm run dev
goto end

:seed_db
echo.
echo ======================================================================
echo  Seeding VoltKart database with inventory, users, and pricing rules...
echo ======================================================================
echo.
cd /d "%~dp0server"
npm run seed
echo.
pause
goto end

:install_all
echo.
echo ======================================================================
echo  Installing dependencies for Server and all 5 Micro-Apps...
echo ======================================================================
echo.
cd /d "%~dp0"
npm run install:all
echo.
echo All dependencies installed!
pause
goto end

:stop_all
echo.
echo Stopping all running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo Done! All VoltKart processes terminated.
pause
goto end

:show_status
echo.
echo  ======================================================================
echo   🚀 VoltKart Multi-App Ecosystem is LIVE!
echo  ======================================================================
echo.
echo   [API Server]        http://localhost:5000  (Health: /health)
echo   [Consumer Web]      http://localhost:5173  (Marketplace, Sell, Orders)
echo   [Agent Mobile App]  http://localhost:5174  (Pickup Checklist & Tests)
echo   [Diagnostic PWA]    http://localhost:5175  (Hardware Sensor Testing)
echo   [Warehouse Portal]  http://localhost:5176  (OS Flashing & QA Audit)
echo   [Admin Console]     http://localhost:5177  (Ops & Appraisal Management)
echo.
echo  ======================================================================
echo   🔑 Pre-Seeded Test Credentials:
echo  ======================================================================
echo   Admin:     admin@voltkart.in        / Admin@1234
echo   Seller:    seller_test@voltkart.in  / Seller@1234
echo   Buyer:     buyer_test@voltkart.in   / Buyer@1234
echo   Agent:     agent1@voltkart.in       / Agent@1234
echo   Engineer:  engineer1@voltkart.in    / Engineer@1234
echo  ======================================================================
echo.
set /p open_browser="Open Consumer Marketplace in your default browser? (Y/n): "
if /i "%open_browser%"=="n" goto end
start http://localhost:5173

:end
exit /b 0

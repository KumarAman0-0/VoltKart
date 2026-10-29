#!/usr/bin/env bash

# VoltKart Multi-App Ecosystem Starter for Linux / macOS / WSL
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "======================================================================"
echo "  ⚡ VoltKart — Privacy-OS Refurbished Marketplace Ecosystem"
echo "======================================================================"
echo ""

# Check for node and npm
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js is not installed. Please install Node.js v18+."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm is not installed. Please install npm."; exit 1; }

echo "[1/6] Starting Backend Server (Port 5000)..."
(cd server && npm run dev) &
PID_SERVER=$!

sleep 3

echo "[2/6] Starting Consumer Web (Port 5173)..."
(cd apps/consumer-web && npm run dev) &
PID_CONSUMER=$!

echo "[3/6] Starting Agent Mobile App (Port 5174)..."
(cd apps/agent-mobile-app && npm run dev) &
PID_AGENT=$!

echo "[4/6] Starting Diagnostic PWA (Port 5175)..."
(cd apps/diagnostic-pwa && npm run dev) &
PID_DIAG=$!

echo "[5/6] Starting Warehouse Portal (Port 5176)..."
(cd apps/warehouse-portal && npm run dev) &
PID_WAREHOUSE=$!

echo "[6/6] Starting Admin Portal (Port 5177)..."
(cd apps/admin-portal && npm run dev) &
PID_ADMIN=$!

echo ""
echo "======================================================================"
echo " 🚀 All 6 VoltKart Services are Running!"
echo "======================================================================"
echo " - Backend API:      http://localhost:5000"
echo " - Consumer Web:     http://localhost:5173"
echo " - Agent App:        http://localhost:5174"
echo " - Diagnostic PWA:   http://localhost:5175"
echo " - Warehouse Portal: http://localhost:5176"
echo " - Admin Console:    http://localhost:5177"
echo "======================================================================"
echo " Press Ctrl+C at any time to gracefully stop all services."
echo ""

# Trap Ctrl+C to kill all background background processes
cleanup() {
    echo ""
    echo "Shutting down all VoltKart services..."
    kill $PID_SERVER $PID_CONSUMER $PID_AGENT $PID_DIAG $PID_WAREHOUSE $PID_ADMIN 2>/dev/null || true
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

wait

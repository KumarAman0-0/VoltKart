# ⚡ VoltKart — Privacy-OS Refurbished Marketplace Ecosystem

> A production-grade managed marketplace for privacy-focused smartphones and tablets running **GrapheneOS**, **/e/OS**, **CalyxOS**, and **LineageOS**.  
> Engineered following the complete **VoltKart System Design & Operations Specification**.

---

## 🌟 Ecosystem Architecture

VoltKart is designed as a distributed multi-app ecosystem. Each role has a dedicated frontend application tailored to its specific viewport and operational requirements, all powered by a centralized Express + WebSocket backend with zero-configuration in-memory database fallback.

```
                              ┌─────────────────────────────────────────┐
                              │       ⚡ VoltKart Backend Server        │
                              │        Port 5000 · Express 5            │
                              │   MongoDB / In-Memory · Socket.io Engine│
                              └────────────────────┬────────────────────┘
                                                   │
         ┌──────────────────┬──────────────────────┼──────────────────────┬──────────────────┐
         │                  │                      │                      │                  │
         ▼                  ▼                      ▼                      ▼                  ▼
┌─────────────────┐ ┌────────────────┐ ┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Consumer Web   │ │Field Agent App │ │ Zero-Install PWA      │ │Warehouse Portal │ │  Admin Console  │
│    Port 5173    │ │   Port 5174    │ │      Port 5175        │ │    Port 5176    │ │    Port 5177    │
│  Buyer Marketplace│ │Doorstep Pickup │ │ Hardware Diagnostics  │ │OS Flasher & QA  │ │  Operations &   │
│  & Seller Portal│ │ & Verification │ │  (Browser Test Suite) │ │Device Intake    │ │   Appraisals    │
└─────────────────┘ └────────────────┘ └───────────┬───────────┘ └─────────────────┘ └─────────────────┘
                                                   │  WebSocket Sync
                                                   └──────────────────────┘
```

---

## 📱 Service Matrix & Port Mapping

| Service / App | Directory | Port | Local URL | Primary Target & Description |
|---|---|---|---|---|
| **Backend API & Real-time Engine** | [`/server`](file:///home/dell/Desktop/Voltkart/server) | `5000` | [http://localhost:5000](http://localhost:5000) | Express 5 REST API, Socket.io WebSocket server, In-Memory Mongo fallback, JWT auth, and PDF engine. |
| **Consumer Web Marketplace** | [`/apps/consumer-web`](file:///home/dell/Desktop/Voltkart/apps/consumer-web) | `5173` | [http://localhost:5173](http://localhost:5173) | Buyer shop & checkout, phone trade-in submission, order tracking, and cryptographic PDF certificate downloads. |
| **Field Agent Mobile App** | [`/apps/agent-mobile-app`](file:///home/dell/Desktop/Voltkart/apps/agent-mobile-app) | `5174` | [http://localhost:5174](http://localhost:5174) | Mobile-first UI for doorstep agents: IMEI validation, bootloader unlock check, live diagnostic progress, instant UPI payout. |
| **Zero-Install Diagnostic PWA** | [`/apps/diagnostic-pwa`](file:///home/dell/Desktop/Voltkart/apps/diagnostic-pwa) | `5175` | [http://localhost:5175](http://localhost:5175) | Runs directly on seller's phone in browser via 6-digit code or QR. Tests touch grid, dead pixels, audio, mic, camera, sensors. |
| **Warehouse Engineer Portal** | [`/apps/warehouse-portal`](file:///home/dell/Desktop/Voltkart/apps/warehouse-portal) | `5176` | [http://localhost:5176](http://localhost:5176) | Warehouse intake scanner, automated Fastboot OS flasher (GrapheneOS, /e/OS), diagnostic benchmarks, QA go-live publisher. |
| **Super Admin Operations Console** | [`/apps/admin-portal`](file:///home/dell/Desktop/Voltkart/apps/admin-portal) | `5177` | [http://localhost:5177](http://localhost:5177) | Platform overview KPIs (GMV, active trade-ins), seller appraisal review, counter-offers, order logistics, user management, audit logs. |
| *Legacy Monolith Client* | [`/client`](file:///home/dell/Desktop/Voltkart/client) | `5173` | [http://localhost:5173](http://localhost:5173) | Monolithic prototype (preserved for backwards compatibility). |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20 / v22 recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* Local MongoDB instance on `mongodb://localhost:27017` — if not running, the server automatically starts an embedded **In-Memory MongoDB**.

---

### Option 1: Windows 1-Click Launchers (`.bat`)

For Windows users, we provide pre-configured batch scripts in the project root:

1. **`start.bat` (Master Interactive Launcher)**:
   - Double-click `start.bat` or run `start.bat` in Command Prompt.
   - Offers an interactive menu:
     - `[1]` Start all 6 services in separate labeled command prompt windows *(Default)*.
     - `[2]` Start all services in a single unified console (concurrently).
     - `[3]` Seed database with demo inventory and test users.
     - `[4]` Install/update all dependencies.
     - `[5]` Stop all running VoltKart Node.js processes.
     - `[6]` Exit.

2. **`start-all.bat` (Direct Zero-Click Launcher)**:
   - Double-click `start-all.bat` to instantly launch all 6 services in dedicated windows and automatically open `http://localhost:5173` in your default browser.

3. **`stop-all.bat` (One-Click Shutdown)**:
   - Double-click `stop-all.bat` to gracefully terminate all running Node.js services.

---

### Option 2: Single Command via `npm` (Cross-Platform)

From the project root:

```bash
# 1. Install dependencies across all apps & server (one-time)
npm run install:all

# 2. Start all 6 services simultaneously with unified color-coded logging
npm run dev
# or
npm start
```

---

### Option 3: Linux / macOS / WSL (`start-all.sh`)

```bash
# Give execution permissions (already configured)
chmod +x start-all.sh

# Run all 6 services in the background with auto-cleanup on Ctrl+C
./start-all.sh
```

---

### Option 4: Individual Service Commands

You can run each service independently from the project root:

```bash
npm run dev:server      # Backend Server (Port 5000)
npm run dev:consumer    # Consumer Web (Port 5173)
npm run dev:agent       # Field Agent App (Port 5174)
npm run dev:diagnostic  # Diagnostic PWA (Port 5175)
npm run dev:warehouse   # Warehouse Portal (Port 5176)
npm run dev:admin       # Admin Console (Port 5177)
```

---

## 🔑 Pre-Seeded Test Credentials

The database automatically seeds on first launch with complete test accounts, pricing matrices, base prices, grade rules, devices, and orders.

| Role | Email | Password | Default Portal & Port |
|---|---|---|---|
| **Super Admin** | `admin@voltkart.in` | `Admin@1234` | [Admin Console (5177)](http://localhost:5177) |
| **Warehouse Engineer** | `engineer1@voltkart.in` | `Engineer@1234` | [Warehouse Portal (5176)](http://localhost:5176) |
| **Field Agent** | `agent1@voltkart.in` | `Agent@1234` | [Agent Mobile App (5174)](http://localhost:5174) |
| **Device Seller** | `seller_test@voltkart.in` | `Seller@1234` | [Consumer Web (5173)](http://localhost:5173) |
| **Marketplace Buyer** | `buyer_test@voltkart.in` | `Buyer@1234` | [Consumer Web (5173)](http://localhost:5173) |

> [!NOTE]  
> All demo accounts have one-click login buttons directly on the authentication screens for rapid testing.

---

## 🔄 Core Workflows & State Machines

### 1. Seller Trade-In & Doorstep Pickup Flow

```
[Seller Submits Request]
         │ (Uploads photos, specifications, condition)
         ▼
[Admin Appraisal Review]
         │ (Admin checks valuation tables & sets offered price)
         ▼
[Seller Decision] ──(Decline)──> [Request Cancelled]
         │
    (Accept / Counter)
         ▼
[Agent Assigned & Dispatched]
         │ (Agent visits seller's doorstep)
         ▼
[Doorstep Verification & Diagnostic]
         │ 1. Seller scans QR / enters code on Diagnostic PWA (Port 5175)
         │ 2. Automated browser tests run (touch, display, audio, mic, camera, sensors)
         │ 3. WebSocket syncs results live to Agent Mobile App (Port 5174)
         │ 4. Agent verifies physical condition, IMEI, and FRP/bootloader status
         ▼
[Instant Payout Triggered]
         │ (Bank transfer / UPI payout generated on spot)
         ▼
[Device Picked Up & In-Transit to Warehouse]
```

---

### 2. Warehouse Refurbishment & OS Flashing Flow

```
[Device Intake Scan]
         │ (Engineer scans package barcode into Warehouse Portal Port 5176)
         ▼
[Hardware Inspection & Benchmarks]
         │ (Screen, battery cycles, ports, camera, thermal stability)
         ▼
[Cryptographic Factory Wipe]
         │ (NIST 800-88 compliant zero-fill data sanitization)
         ▼
[Automated OS Flashing]
         │ (Engineer selects Privacy OS: GrapheneOS, /e/OS, CalyxOS, or LineageOS)
         │ (Real-time simulated fastboot build logs, checksum verification, bootloader re-lock)
         ▼
[Final QA & Certificate Generation]
         │ (Digital PDF Hardware & OS Certification generated with unique SHA-256 hash)
         ▼
[Live Inventory Listing]
         │ (Device automatically appears in Consumer Shop Port 5173)
```

---

### 3. Buyer Purchase & Fulfillment Flow

```
[Buyer Browses Shop] ──> [Filter by OS, Grade, Model] ──> [Atomic Cart Reservation]
                                                                  │
                                                                  ▼
                                                      [Checkout & Payment Verification]
                                                                  │
                                                                  ▼
                                                      [Warehouse Packing & Dispatch]
                                                                  │
                                                                  ▼
                                                      [Courier Tracking & Delivery]
                                                                  │
                                                                  ▼
                                                      [Download Invoices & Certificates]
```

---

## 🔬 Zero-Install Diagnostic PWA Features

The **Diagnostic PWA** (`apps/diagnostic-pwa`) runs directly in any modern mobile browser without requiring app installation:

1. **Touchscreen Matrix**: 24-box interactive grid requiring user swipe coverage to detect dead zones.
2. **Display & Dead Pixel Sweep**: Full-screen cycling of Red, Green, Blue, White, and Black canvases to reveal pixel burn-in or tinting.
3. **Audio Acoustics**: Multi-frequency sine-wave chime generated via Web Audio API.
4. **Microphone Decibel Monitor**: Real-time Web Audio API `AnalyserNode` frequency spectrum measuring ambient voice input.
5. **Front & Rear Cameras**: Live `getUserMedia` video preview with instant lens toggle.
6. **Motion & Orientation**: Web `DeviceOrientationEvent` gyroscope tracking with interactive visual bubble level.
7. **Battery Health**: Web Battery API measuring charging state and discharge levels.
8. **Real-Time WebSocket Sync**: Every test completion automatically triggers a `test_progress` event to the assigned agent's screen in real time.

---

## 📁 Repository Structure

```
Voltkart/
├── start.bat                   # Master interactive Windows launcher
├── start-all.bat               # Direct 1-click Windows launcher (all 6 services)
├── stop-all.bat                # Windows Node.js process killer
├── start-all.sh                # Linux / macOS / WSL multi-service launcher
├── package.json                # Monorepo root scripts & devDependencies
│
├── apps/
│   ├── consumer-web/           # [Port 5173] Buyer marketplace, checkout, seller trade-in
│   │   ├── src/pages/buyer/    # ShopPage, DeviceDetailPage, CheckoutPage, MyOrdersPage
│   │   └── src/pages/seller/   # SellerDashboard, NewSellRequest, CounterOfferModal
│   │
│   ├── agent-mobile-app/       # [Port 5174] Field agent mobile inspection checklist
│   │   └── src/pages/agent/    # AgentDashboard, AgentInspectionFlow, DoorstepPayout
│   │
│   ├── diagnostic-pwa/         # [Port 5175] Zero-install browser hardware testing suite
│   │   └── src/pages/diagnostic/# DiagnosticEntry, DiagnosticPage (touch, mic, cam, audio)
│   │
│   ├── warehouse-portal/       # [Port 5176] Intake, OS flasher, diagnostic QA, go-live
│   │   └── src/pages/engineer/ # EngineerDashboard, DeviceIntake, OSFlasherModal
│   │
│   └── admin-portal/           # [Port 5177] Platform KPIs, appraisals, logistics, users
│       └── src/pages/admin/    # AdminDashboard, AdminRequests, AdminOrders, AdminUsers
│
├── server/                     # [Port 5000] Express REST API & WebSockets
│   ├── config/                 # db.js (with In-Memory MongoDB fallback)
│   ├── controllers/            # auth, seller, buyer, agent, engineer, admin, inspection
│   ├── middleware/             # auth (JWT), errorHandler, allowRoles
│   ├── models/                 # User, Device, SellRequest, Order, Inspection, Deduction
│   ├── routes/                 # API route definitions
│   ├── scripts/                # autoSeed.js (rich sample data), seed.js
│   ├── services/               # certificateService.js (PDFKit certificate generation)
│   ├── socket.js               # Socket.io room management & real-time test sync
│   └── index.js                # Server entry point
│
└── client/                     # [Port 5173] Legacy monolithic client (v1 reference)
```

---

## ⚙️ Environment Variables

The backend comes pre-configured with zero-friction defaults. To customize, adjust [`server/.env`](file:///home/dell/Desktop/Voltkart/server/.env):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/voltkart   # Automatically falls back to In-Memory MongoDB if unavailable
JWT_SECRET=voltkart_super_secret_jwt_2024
JWT_REFRESH_SECRET=voltkart_refresh_secret_2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 🛡️ Security & Privacy Pillars

1. **Hardware & KYC Privacy Barrier**: Seller KYC and payout bank details are completely isolated from buyers, field engineers, and public APIs.
2. **Atomic Inventory Locking**: Purchases utilize atomic MongoDB updates to prevent race conditions or double-allocating stock.
3. **Role-Based Access Control (RBAC)**: Strict `allowRoles(...)` middleware verifies every privileged endpoint against verified JWT claims.
4. **Cryptographic Proof of Refurbishment**: Every flashed device is issued a verifiable SHA-256 digital certificate detailing the build date, OS hash, and QA inspector.

---

## 🤝 Contributing & Maintenance

- To add or modify deduction rules, inspect [`server/scripts/autoSeed.js`](file:///home/dell/Desktop/Voltkart/server/scripts/autoSeed.js).
- To re-seed the database at any time, run:
  ```bash
  npm run seed
  ```
- To build production bundles for all micro-frontends:
  ```bash
  npm run build:all
  ```

# ServiceMan – Your One-Stop On-Demand Service Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Geospatial-brightgreen.svg)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-orange.svg)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **ServiceMan** is a complete, production-ready, fully integrated full-stack on-demand service marketplace connecting households and businesses with background-verified service professionals across NCR cities (Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Meerut) and beyond.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Demo Credentials](#demo-credentials)
3. [Architecture Overview](#architecture-overview)
4. [Tech Stack](#tech-stack)
5. [Folder Structure](#folder-structure)
6. [Setup & Installation](#setup--installation)
7. [Cloud Deployment & Portals Guide](#cloud-deployment--portals-guide)
8. [Quality Control & 3-Tier Penalty System](#quality-control--3-tier-penalty-system)

---

## 1. Core Features

### A. Customer Module
- **Service Request Wizard**: Interactive category selection (Mechanic, Electrician, Homemaker/Cleaner, Doctor, Caretaker, Tutor, Plumber, Painter), sub-service selection, problem description, urgency flags (`standard`, `urgent`, `emergency`), and GPS coordinate detection.
- **AI Radar Matching**: Real-time provider search ranking candidate professionals based on distance, trust score, ratings, experience, and acceptance rate.
- **Live GPS Tracking**: Interactive Leaflet map displaying real-time technician vehicle coordinates, route line, distance, and estimated arrival time (ETA).
- **Service Verification**: Customer 4-digit Start OTP code to authorize commencement of work.
- **In-App Live Chat**: Real-time messaging with assigned technician via Socket.io with read receipts.
- **Verified Reviews**: Star ratings (1-5) and written reviews evaluated by the AI Review Analyzer.

### B. Service Provider Module
- **Multi-Step Onboarding**: Professional profile setup with trade categories, experience years, hourly rates, service radius (km), and bank details.
- **KYC Verification Desk**: Secure document upload for Government Aadhaar, PAN, Trade Licenses, and Degree Certificates.
- **Online / Offline Toggle**: Real-time availability control and GPS telemetry streaming.
- **Incoming Job Dispatches**: Modal alert with 60-second animated countdown timer, distance, customer problem, and 1-click Accept/Decline.
- **Active Job Stepper**: `ACCEPTED` → `ON THE WAY` → `ARRIVED` → `SERVICE STARTED` (with customer OTP verification) → `SERVICE COMPLETED`.
- **Earnings & Ledger**: Real-time wallet tracking, 15% platform commission calculation, 85% net earnings, and payout transfer ledger.
- **Verified & Trusted Badge**: Granted automatically to providers maintaining a Trust Score ≥ 80%, Rating ≥ 4.2, verified KYC, and zero active penalties.

### C. Admin Control Center
- **Executive KPI Dashboard**: Live counts for total customers, providers, verified partners, pending KYC documents, active dispatches, completed jobs, gross volume, and open complaints.
- **KYC Document Queue**: Review uploaded identity documents and trade licenses with 1-click Approve or Reject (with feedback).
- **Provider Management & Sanctions**: Search and filter by city, category, KYC status, and trust score. Issue warnings, 30-day temporary suspensions, or permanent identity bans.
- **Complaints & Dispute Resolution**: Examine customer/provider dispute tickets and evidence, and trigger automated penalty escalations.
- **AI Review & Fraud Monitor**: Real-time feed of all submitted reviews analyzed by NLP for sentiment polarity (-1.0 to +1.0), spam patterns, coordinated shill attacks, and abusive language.
- **Analytics & Demographics**: Multi-dimensional charts of booking density by NCR city, category demand, revenue, and trust score tiers.
- **Security Audit Trail**: Immutable logging of all sensitive administrative decisions with actor, IP address, and timestamps.

---

## 2. Demo Credentials

Seed data includes pre-configured demo accounts for immediate end-to-end testing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@serviceman.com` | `Password123!` | Rahul Sharma, Sector 128, Noida |
| **Verified Provider (Mechanic)** | `provider@serviceman.com` | `Password123!` | Vikram Singh, 92% Trust Score, **Verified & Trusted Badge** |
| **Verified Provider (Electrician)** | `electrician@serviceman.com` | `Password123!` | Amit Verma, 88% Trust Score, 1 Warning |
| **Pending KYC Provider (Homemaker)** | `cleaner@serviceman.com` | `Password123!` | Pooja Rani, Ghaziabad, KYC Pending |
| **Administrator** | `admin@serviceman.com` | `Admin123!` | Aditya Malhotra, Full System Control |

---

## 3. Architecture Overview

```
Frontend (React 18 + Vite + Tailwind CSS)
   │
   ├── REST API (Axios + JWT Auth + Rate Limiter)
   │     ▼
   ├── Backend (Node.js + Express)
   │     ├── Services (Matching Engine, AI Review Analyzer, Trust & Penalty Engine, Razorpay)
   │     ├── Database (MongoDB + 2dsphere Geospatial Indexing)
   │     └── Cache & Mutex (Redis / In-Memory Mutex Lock for Concurrency Safety)
   │
   └── Real-Time Telemetry (Socket.io)
         ├── User Personal Rooms (user_{userId})
         ├── Active Booking Dispatch (booking_{bookingId})
         └── Admin Telemetry Feed (admin_feed)
```

---

## 4. Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM 6, Lucide Icons, Leaflet / React-Leaflet, Socket.io-client, Axios.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose (MongoDB ODM), Bcryptjs, JSON Web Tokens (JWT), Multer, Helmet, Morgan, Express Rate Limit.
- **Real-Time & Cache**: Socket.io WebSocket channels, Redis distributed locking / in-memory cache fallback.
- **Payments**: Razorpay Order & Webhook verification with test mode simulation.
- **AI / NLP**: Built-in NLP Sentiment Polarity lexicon engine, abusive term regex filter, and repeated review fraud pattern detector.

---

## 5. Folder Structure

```
final-year-project/
├── .gitignore               # Global Git ignore preventing secrets and node_modules from upload
├── package.json             # Root workspace runner (install:all, dev:server, dev:client, seed)
├── DEPLOYMENT_GUIDE.md      # Detailed cloud deployment manual (Atlas, Render, Vercel, Razorpay)
├── README.md                # System documentation
│
├── server/                  # Backend Node.js / Express / Socket.io / Mongoose API
│   ├── .env.example         # Template for environment variables (safe for GitHub)
│   ├── .env                 # Local secrets (strictly GITIGNORED)
│   ├── .gitignore           # Server specific ignores
│   ├── package.json         # Server dependencies & scripts
│   ├── src/
│   │   ├── config/          # db.js, redis.js, env.js
│   │   ├── models/          # User, Customer, Provider, Booking, KycDocument, Review, etc.
│   │   ├── controllers/     # auth, customer, provider, admin, chat, review, kyc, payment
│   │   ├── middleware/      # auth, rbac, upload, errorHandler, auditLogger
│   │   ├── services/        # geoService, matchingEngine, aiReviewAnalyzer, trustService
│   │   ├── routes/          # API route definitions
│   │   ├── sockets/         # socketHandler.js (WebSocket rooms & events)
│   │   ├── utils/           # seed.js (5 users, 3 providers, verified KYC, dispatches)
│   │   ├── tests/           # runTests.js
│   │   └── server.js        # Express & Socket.io server bootstrap
│   └── uploads/             # Static user uploads (avatars, chat, kyc, problems)
│
└── client/                  # Frontend React 18 / Vite / Tailwind CSS / Leaflet SPA
    ├── .env.example         # Template for frontend environment variables (safe for GitHub)
    ├── .env                 # Local frontend config (strictly GITIGNORED)
    ├── .gitignore           # Client specific ignores
    ├── vercel.json          # Vercel deep-linking rewrite rules for React Router
    ├── vite.config.js       # Vite dev server with /api proxy & build config
    ├── tailwind.config.js   # Tailwind styling configurations
    ├── package.json         # Client dependencies & scripts
    ├── index.html           # HTML entry point
    └── src/
        ├── components/      # UI components (Navbar, Footer, MapTracker, StatusBadge, etc.)
        ├── context/         # AuthContext.jsx, SocketContext.jsx
        ├── pages/           # Customer, Provider, Admin, and Public views
        ├── services/        # api.js (dynamic API URL), socket.js (dynamic WebSocket URL)
        ├── App.jsx          # App routing
        ├── main.jsx         # React root
        └── index.css        # Tailwind directives & custom CSS
```

---

## 6. Setup & Installation

### Prerequisites
- Node.js v18+ (tested on Node v20/v22/v24)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/serviceman` or MongoDB Atlas URI)

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Seed the Database
```bash
npm run seed
```

### Step 3: Run Test Suite
```bash
npm run test:server
```

### Step 4: Run Application
```bash
# Terminal 1: Start Server
npm run dev:server

# Terminal 2: Start Client
npm run dev:client
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 7. Cloud Deployment & Portals Guide

For complete step-by-step instructions, see the dedicated [DEPLOYMENT_GUIDE.md](file:///c:/Users/dheer/OneDrive/Desktop/final%20year%20project/DEPLOYMENT_GUIDE.md).

### Quick Portals Overview:
1. **Cloud Database**: [MongoDB Atlas](https://cloud.mongodb.com) (Free M0 Cluster) → Set Network Access to `0.0.0.0/0`, obtain `MONGODB_URI`.
2. **Backend**: [Render](https://render.com) → Create Web Service, Root Directory: `server`, Build: `npm install`, Start: `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`.
3. **Frontend**: [Vercel](https://vercel.com) → Import repo, Root Directory: `client`, Framework: `Vite`. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your Render backend URL.
4. **Payments (Optional)**: [Razorpay Dashboard](https://dashboard.razorpay.com) → Toggle Test Mode, generate Test API Key ID & Secret.
5. **Maps (Optional)**: [Google Cloud Console](https://console.cloud.google.com) → Leaflet OpenStreetMap is built-in with zero cost if omitted.

---

## 8. Quality Control & 3-Tier Penalty System

The platform implements automated quality enforcement:

```
Service Completed → Customer Rating & Review → AI / NLP Analysis
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                              High Rating / Clean           Severe Complaint / Fraud
                                     │                           │
                                     ▼                           ▼
                          Trust Score Boost (+2)         1st Issue: Official Warning
                                     │                           │
                                     ▼                           ▼
                        "Verified & Trusted" Badge      2nd Issue: 30-Day Suspension
                                                                 │
                                                                 ▼
                                                        3rd Issue: Permanent National ID Ban
```

1. **1st Verified Violation**: Official Warning recorded on profile.
2. **2nd Verified Violation**: 30-Day Suspension (provider account automatically disabled from dispatch and matching).
3. **3rd Verified Violation / Fraud**: Permanent Ban (account locked, login disabled, national identity hashed into blacklist to block future re-registration).

---

## 9. License

This project is licensed under the MIT License. Built for advanced real-world on-demand services research and deployment.

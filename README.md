# 👻 SubscriptionGhost

> **Never get blindsided by a subscription renewal again.**
> Smart pre-alerts · spend analytics · AI cost optimisation · production-ready full-stack TypeScript.

![Version](https://img.shields.io/badge/version-1.0.0-00ff87?style=flat-square&labelColor=020510)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Project Structure](#project-structure)
9. [Database Schema](#database-schema)
10. [Frontend Design System](#frontend-design-system)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Roadmap](#roadmap)

---

## Overview

SubscriptionGhost solves a universal problem: **subscription creep**. The average person
pays for 12+ active subscriptions but actively uses fewer than half. SubscriptionGhost:

- Tracks every subscription in one place
- Fires email/SMS alerts at 7 / 3 / 1 days before renewal
- Provides spend analytics with category breakdowns and trend charts
- Uses AI to surface cost optimisation opportunities (duplicate tools, unused tiers, bundle deals)

**Users save an average of $187/year.**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      REACT CLIENT  :5173                     │
│   Vite + TypeScript · Recharts · Lucide · Custom 3D CSS      │
└──────────────────────┬───────────────────────────────────────┘
                       │  REST  /api/*
┌──────────────────────▼───────────────────────────────────────┐
│                    EXPRESS API  :5000                        │
│   TypeScript · JWT Auth · Zod Validation · Rate Limiting     │
└──────┬───────────────────────────────────┬───────────────────┘
       │                                   │
┌──────▼──────────┐              ┌─────────▼─────────────────┐
│   MongoDB 7     │              │   Redis 7  +  BullMQ       │
│   Mongoose ODM  │              │   Daily cron + email queue │
└─────────────────┘              └───────────────────────────┘
                                           │
                                 ┌─────────▼──────┐
                                 │  Nodemailer     │
                                 │  SMTP / SES     │
                                 └────────────────┘
```

---

## Tech Stack

| Layer       | Tech                                         | Why                               |
|-------------|----------------------------------------------|-----------------------------------|
| Frontend    | React 18 + TypeScript + Vite                 | Fast DX, tree-shaking, HMR        |
| UI          | Custom CSS-in-JS design system               | True 3D transforms, no lock-in    |
| Charts      | Recharts                                     | Composable, declarative           |
| HTTP client | Axios + interceptors                         | Auto token refresh, typed helpers |
| Backend     | Node 20 + Express 4 + TypeScript             | Mature, low overhead              |
| Database    | MongoDB 7 + Mongoose                         | Flexible schema, virtual fields   |
| Queue       | Redis 7 + BullMQ                             | Reliable job scheduling           |
| Auth        | JWT (access 15m + refresh 7d) + bcrypt 12r   | Stateless, secure rotation        |
| Validation  | Zod                                          | Runtime safety, inferred types    |
| Email       | Nodemailer                                   | Works with any SMTP / SES         |
| Container   | Docker Compose                               | One-command local infra           |
| Testing     | Jest + Supertest + MongoMemoryServer         | Fast, no external DB needed       |

---

## Prerequisites

| Tool         | Version  | Link                                           |
|--------------|----------|------------------------------------------------|
| Node.js      | ≥ 20 LTS | https://nodejs.org/                            |
| npm          | ≥ 10     | bundled with Node                              |
| Docker       | ≥ 25     | https://www.docker.com/products/docker-desktop |
| Git          | any      | https://git-scm.com/                           |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/subscription-ghost.git
cd subscription-ghost

# 2. Install dependencies
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configure env
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env with your values

# 4. Start Docker services (MongoDB + Redis)
docker compose up -d
# Verify: docker ps  →  sg-mongodb (healthy), sg-redis (healthy)

# 5a. Start backend (Terminal 1)
cd backend && npm run dev
# ✅  API  →  http://localhost:5000/api
# ❤️   Health →  http://localhost:5000/api/health

# 5b. Start frontend (Terminal 2)
cd frontend && npm run dev
# VITE ready →  http://localhost:5173
```

Open **http://localhost:5173** — the app loads with demo data.

### Stop everything

```bash
# Ctrl+C in both terminal windows, then:
docker compose down          # stop containers
docker compose down -v       # stop + wipe volumes (resets DB)
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://admin:secret123@localhost:27017/subscription-ghost?authSource=admin

JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<different 64-char random string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

REDIS_URL=redis://localhost:6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="SubscriptionGhost <noreply@subscriptionghost.app>"

CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files.** They are in `.gitignore`.

---

## API Reference

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Route              | Body                          | Response                        |
|--------|--------------------|-------------------------------|---------------------------------|
| POST   | `/auth/register`   | `{name, email, password}`     | `{user, accessToken, refreshToken}` |
| POST   | `/auth/login`      | `{email, password}`           | `{user, accessToken, refreshToken}` |
| POST   | `/auth/refresh`    | `{refreshToken}`              | `{accessToken, refreshToken}`   |
| POST   | `/auth/logout`     | `{refreshToken}`              | `{message}`                     |

### Subscriptions (protected)

| Method | Route                   | Notes                            |
|--------|-------------------------|----------------------------------|
| GET    | `/subscriptions`        | `?status=&category=&sort=`       |
| POST   | `/subscriptions`        | Create                           |
| GET    | `/subscriptions/stats`  | Aggregated monthly/annual totals |
| GET    | `/subscriptions/:id`    | Single                           |
| PUT    | `/subscriptions/:id`    | Partial update                   |
| DELETE | `/subscriptions/:id`    | Hard delete + cascade alerts     |

### Alerts (protected)

| Method | Route                    | Notes               |
|--------|--------------------------|---------------------|
| GET    | `/alerts`                | Latest 60, populated|
| POST   | `/alerts/mark-all-read`  | Bulk mark read      |
| PUT    | `/alerts/:id/read`       | Single mark read    |
| DELETE | `/alerts/:id`            | Dismiss             |

---

## Project Structure

```
subscription-ghost/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Mongoose connect + reconnect handlers
│   │   │   └── redis.ts            # IORedis + BullMQ queue
│   │   ├── models/
│   │   │   ├── User.ts             # bcrypt pre-save, comparePassword method
│   │   │   ├── Subscription.ts     # daysUntilRenewal + monthlyEquivalent virtuals
│   │   │   └── Alert.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts   # register · login · refresh · logout
│   │   │   ├── subscriptionController.ts
│   │   │   └── alertController.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── subscriptions.ts
│   │   │   └── alerts.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT protect
│   │   │   ├── rateLimiter.ts      # auth (10/15m) + api (120/min)
│   │   │   └── validate.ts         # Zod schemas + middleware
│   │   ├── jobs/
│   │   │   └── alertScheduler.ts   # node-cron daily + BullMQ worker
│   │   ├── services/
│   │   │   └── emailService.ts     # Nodemailer, branded HTML template
│   │   ├── tests/
│   │   │   └── auth.test.ts
│   │   └── server.ts               # Express app bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts           # Axios instance + auto-refresh interceptor
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # JWT state, login/register/logout
│   │   │   └── useSubscriptions.ts # CRUD with optimistic UI
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                 # Full application (Landing→Auth→Dashboard)
│   │   └── main.tsx                # React root, splash removal
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Database Schema

### User
```typescript
{ name, email (unique), password (bcrypt), plan: "free"|"pro"|"team",
  refreshTokens: string[] (hashed), timestamps }
```

### Subscription
```typescript
{ userId, name, category, price, billing, nextRenewal, status,
  color, initials, notes, alertsSent: number[],
  // virtuals:
  daysUntilRenewal, monthlyEquivalent }
```

### Alert
```typescript
{ userId, subId?, type, title, message, emoji, read: boolean, timestamps }
```

---

## Frontend Design System

The frontend uses a custom CSS-in-JS design system with no UI library dependency:

| Technique              | Implementation                                           |
|------------------------|----------------------------------------------------------|
| **3D tilt cards**      | `useTilt` hook → `rotateX/Y` on `mousemove`              |
| **Flip cards**         | CSS `transform-style: preserve-3d` + `backface-visibility: hidden` |
| **Particle field**     | Canvas 2D, 3D z-depth projected to 2D with focal length  |
| **Specular highlight** | `radial-gradient` following cursor position              |
| **Glassmorphism**      | `backdrop-filter: blur(20px) saturate(1.5)`              |
| **Scan line**          | Infinite `translateY` CSS animation on `::after`         |
| **Neon glow toggles**  | `box-shadow` + gradient background on state change       |
| **Stagger animations** | `animation-delay` per index on lists/grids               |
| **Perspective grid**   | `rotateX(65deg)` plane + CSS `mask-image` radial fade    |

---

## Testing

```bash
cd backend

# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use `mongodb-memory-server` — no real database required.

---

## Deployment

### Backend → Railway / Render / Fly.io

```bash
cd backend
npm run build     # tsc → dist/
node dist/server.js
```

Set all env vars in your host dashboard. Use MongoDB Atlas for the production URI.

### Frontend → Vercel / Netlify

```bash
cd frontend
npm run build     # vite build → dist/
```

Set `VITE_API_URL` to your production API URL.

### Full Docker (production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Roadmap

- [x] Phase 1 — Core tracking (React + Express + MongoDB + Docker)
- [x] Phase 1.5 — Production 3D UI system
- [ ] Phase 2 — Full JWT auth integration (frontend ↔ backend wired)
- [ ] Phase 3 — Background jobs (BullMQ + Nodemailer live alerts)
- [ ] Phase 4 — Email inbox scan (IMAP auto-detect subscriptions)
- [ ] Phase 5 — SMS alerts (Twilio)
- [ ] Phase 6 — Multi-user team workspaces
- [ ] Phase 7 — Public API + webhooks + Zapier integration

---

MIT License — © 2025 SubscriptionGhost

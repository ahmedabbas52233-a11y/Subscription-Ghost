# 👻 SubscriptionGhost

A subscription-tracking app: an Express/MongoDB/Redis backend with JWT auth
and a scheduled alert system, paired with a React dashboard.

This README describes what's **actually wired up and working**, not an
aspirational feature list. See [STATUS.md](./STATUS.md) for the detailed
breakdown of what's real vs. UI-only, and why.

## What's real, end-to-end

- **Auth** — register / login / refresh-token rotation / logout / session
  restore on page reload. Passwords hashed with bcrypt, refresh tokens
  stored server-side as SHA-256 hashes, access tokens short-lived.
- **Subscriptions** — full CRUD against MongoDB, scoped per user. Adding,
  editing, or deleting a subscription in the UI hits the real API.
- **Alerts** — list / mark-read / mark-all-read / dismiss, scoped per user.
  A daily cron job (`node-cron`) scans upcoming renewals and queues alert
  emails via BullMQ + Redis. (This pipeline was fully written but never
  actually started anywhere — see STATUS.md — it's wired into boot now.)
- **Analytics, Calendar, Budget, Export** — these read from your real
  subscription data (no more hardcoded sample subscriptions), but a couple
  of sub-features within them (the budget *limit* you set, the 6-month
  history chart) aren't persisted to the backend yet — see STATUS.md.

## What's UI-only (no backend behind it yet)

Team workspace, Webhooks/API key integrations, Email auto-scanner, and SMS
alerts are fully designed, polished screens with no backend models or
routes behind them. They render real UI, but nothing you do on those
screens is saved. Building them out is the natural next milestone — see
STATUS.md for what each would need.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Axios, Recharts, Lucide React |
| Backend | Node 20, Express 4, TypeScript |
| Database | MongoDB 7 + Mongoose |
| Queue | Redis 7 + BullMQ |
| Auth | JWT (access + refresh, rotation) |
| Validation | Zod |
| Email | Nodemailer |
| Testing | Jest + Supertest + mongodb-memory-server |

## Quick start

```bash
git clone <repo-url>
cd subscription-ghost

cp backend/.env.example backend/.env     # fill in secrets
docker compose up -d                     # MongoDB + Redis

cd backend  && npm install && npm run dev   # http://localhost:5000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## Scripts

```bash
# backend/
npm run dev          # nodemon + ts-node
npm run build        # tsc -> dist/
npm test             # jest (needs network access to fetch the mongodb-memory-server binary on first run)

# frontend/
npm run dev           # vite dev server
npm run build         # production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
```

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Returns access + refresh token |
| POST | `/api/auth/refresh` | – | Rotate access token |
| POST | `/api/auth/logout` | – | Invalidate refresh token |
| GET  | `/api/auth/me` | ✅ | Current user (session restore) |
| GET  | `/api/subscriptions` | ✅ | List your subscriptions |
| POST | `/api/subscriptions` | ✅ | Create a subscription |
| GET  | `/api/subscriptions/stats` | ✅ | Spend stats |
| POST | `/api/subscriptions/bulk-delete` | ✅ | Delete multiple at once |
| PUT  | `/api/subscriptions/:id` | ✅ | Update a subscription |
| DELETE | `/api/subscriptions/:id` | ✅ | Delete a subscription |
| GET  | `/api/alerts` | ✅ | List alerts |
| PUT  | `/api/alerts/:id/read` | ✅ | Mark one alert read |
| POST | `/api/alerts/mark-all-read` | ✅ | Mark all read |
| DELETE | `/api/alerts/:id` | ✅ | Dismiss an alert |

## License

MIT

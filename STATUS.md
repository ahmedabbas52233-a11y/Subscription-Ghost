# Project Status

Last updated: this pass. This file exists so nobody — including future-you —
has to re-discover the gap between "looks finished" and "is finished" by
reading 2,500 lines of JSX.

## ✅ Fully wired, frontend → backend → database

| Feature | Notes |
|---|---|
| Register / Login | bcrypt(12), Zod-validated, rate-limited |
| Session restore on reload | `GET /auth/me` via stored access token |
| Logout | Revokes the specific refresh token (was previously revoking refresh tokens for *every user in the database* — fixed) |
| Subscriptions: create / list / update / delete | Scoped per user, ownership-checked on every op |
| Subscriptions: bulk delete | Added — the frontend hook already expected this endpoint; it didn't exist server-side |
| Subscriptions: stats | Real aggregate spend, computed server-side from Mongoose virtuals |
| Alerts: list / mark read / mark all read / dismiss | Scoped per user |
| Alerts: scheduled generation | `node-cron` + BullMQ worker scans renewals daily, queues alert jobs |

## 🟡 Real data, partially real features

These pages now receive your actual subscriptions from the API instead of
a hardcoded sample array, so their headline numbers (total spend, category
breakdown, what's on the calendar, what's in the CSV export) are real. But:

- **Budget Tracker** — current spend vs. budget is real; the *budget limit*
  you type in is local component state only (`useState`), not persisted.
  Needs: a `budgetLimit` field on the User (or a small `Budget` model) +
  a `PUT /api/budget` endpoint.
- **Budget Tracker: 6-month history chart** — only the current month is
  real; the prior 5 months are hardcoded sample numbers. Needs: either a
  monthly snapshot job that records spend over time, or computing it
  retroactively from subscription `createdAt`/price-change history (which
  isn't tracked yet either).
- **Export Center** — CSV export is genuinely functional (builds a real
  `Blob`, triggers a real browser download) and now exports your real
  subscriptions. JSON/PDF export buttons and the "recent exports" history
  list are still cosmetic.

## 🔴 UI only — no backend behind it

These are fully designed, polished screens. Nothing on them persists.

| Feature | What it would take to make it real |
|---|---|
| Team workspace | A `Team` model (members, roles), invite flow (email + token), and scoping `Subscription`/`Alert` queries to a `teamId` in addition to `userId`. Medium-sized feature. |
| Integrations (webhooks, Slack, API keys) | An `Integration` model per user, a webhook-dispatch step in the alert worker, and an API-key auth strategy alongside the existing JWT one for any public API usage. |
| Email auto-scanner | This is a real OAuth + email-parsing integration (Gmail/Outlook API), not a small lift. Needs OAuth app registration, token storage, an email-parsing job, and a confidence-scoring heuristic or model. Largest item on this list. |
| SMS alerts | Needs a Twilio (or similar) account, a `phoneNumber` + verification-code flow on the User model, and a new alert-delivery channel in the worker alongside the existing email one. |

## Bugs fixed in this pass

Beyond the "not wired to the backend" gap, these were genuine, independent
bugs found while doing the wiring — most would have caused the app to
crash or misbehave even with a perfect backend connection:

- **Build-breaking syntax error**: missing comma in the `lucide-react`
  import — the app could not build or run at all, in its prior state.
- **`FEATURES` is not defined**: the landing page (first screen anyone
  sees) referenced the wrong variable name and would crash on render.
- **`StatusPill` is not defined**: referenced in 3 places, never defined.
  Dashboard, and both Subscriptions views, would crash on render.
- **Missing icon imports**: `Users`, `Webhook`, `Key`, `Copy`, `RefreshCw`,
  `Send` were used but never imported from `lucide-react`.
- **`AlertsPage` ignored its own props**: it received `alertsData` from
  its parent but maintained a separate internal `useState` instead, so the
  sidebar's unread-count badge and the actual Alerts page never agreed
  with each other — independent of any backend issue.
- **Logout revoked the wrong user's session**: `User.updateMany({}, ...)`
  pulled the refresh token from every user in the collection instead of
  the token's actual owner.
- **Backend wouldn't compile on a fresh `npm install`**: `tsconfig.json`'s
  `moduleResolution` setting, and version drift in `jsonwebtoken`/`bullmq`
  type definitions vs. the code written against them, meant `tsc` failed
  outright. BullMQ v5 also removed `QueueScheduler`, which the scheduler
  code still imported.
- **The only backend test couldn't run**: wrong relative import path, and
  no `jest.config.js` wiring up `ts-jest` (which was a listed dependency
  but never actually configured).
- **No ESLint config**: `eslint` was a dependency with a `lint` script,
  but no `.eslintrc` existed, so `npm run lint` failed immediately.
- **Two conflicting Vite configs**: `vite.config.js` and `vite.config.ts`
  existed simultaneously with diverging content; the `.ts` one referenced
  `react-router-dom`, which isn't even a project dependency.
- **Missing standard Vite/TS scaffolding**: `src/vite-env.d.ts` (needed
  for `import.meta.env` to typecheck) and a dangling reference to a
  `tsconfig.node.json` that was never created.
- **`frontend/package.json` was missing `axios` and `typescript`** despite
  `.ts` files in the repo importing/requiring both — meaning those files
  had never actually been compiled or run since they were added.

## Bugs fixed in a second, deeper audit pass

Doing a genuinely complete review (not just re-confirming the first pass)
surfaced more independent issues — including two in my own first-pass code,
caught by tracing through the actual execution order rather than assuming
the fix worked:

- **The entire alert pipeline was dead code**: `startAlertScheduler()` and
  `startAlertWorker()` in `jobs/alertScheduler.ts` were fully and correctly
  implemented, but never imported or called anywhere — including not from
  `server.ts`. The cron check and the email-sending worker never actually
  ran in the deployed app. Same issue with `verifySmtp()` in
  `emailService.ts`. All three are now started on boot.
- **Status field meaning mismatch**: the backend's `status` is a
  subscription *lifecycle* state (`active`/`paused`/`cancelled`); the UI's
  `status` is a *renewal urgency* state (`active`/`urgent`/`overdue`),
  derived from days-until-renewal in the original mock data. The adapter
  was passing the backend value straight through, so every real
  subscription always displayed as plain "Active" no matter how soon it
  was renewing, and the Dashboard's "N renewals need attention" count and
  the Calendar's overdue stat would always read zero. Now derived properly
  from `daysUntilRenewal`.
- **Date parsing was backwards**: the adapter's "convert a UI date string
  to an API payload" function appended the current year to *every* date
  string before parsing. That's correct for the email-scanner's fuzzy
  `"May 01"` mock strings, but the Add-Subscription form's real
  `<input type="date">` already sends a clean ISO string
  (`"2026-06-30"`), and appending a year to that produces `Invalid Date`,
  silently discarding the user's actual chosen renewal date. Fixed to
  detect and parse ISO strings directly, and only apply the
  year-appending heuristic to non-ISO fuzzy strings.
- **(Caught before shipping) Session restore race condition**: my first
  pass split "fetch the current user" and "decide which screen to show"
  across two separate `useEffect`s coordinating through a hook's internal
  `loading`/`user` state. Tracing the actual effect execution order showed
  the screen-decision effect always ran with stale, pre-update values
  before the in-flight request's state change was reflected in any
  render — so a logged-in user refreshing the page was always bounced to
  the landing screen instead of being restored. Rewritten so the
  restoration effect awaits `refreshUser`'s return value directly, with no
  cross-effect state-watching to race against.
- **(Caught before shipping) Double hook instance**: also in my first
  pass, `App()` briefly called `useAuth()` twice, which creates two
  independent state instances that don't share data — `refreshUser`
  called on one instance never affected the other's `user` value.
- **Missing icon imports**: `Users` and `Webhook` (used in the Sidebar
  nav) were never imported — on top of the `Key`/`Copy`/`RefreshCw`/`Send`
  ones found in the first pass.

## Known non-bugs / pre-existing gaps confirmed, not changed

- The "Edit" button on both the Subscriptions card view and the Team
  page's member list has no `onClick` handler at all — purely decorative.
  Editing an existing subscription isn't a missing *wire-up*, it's a
  feature that was never built (only Add and Delete are). Not something
  this pass broke; flagging it so it doesn't surprise whoever builds it.
- `GET /subscriptions` defaults to `status=active` when no query param is
  given, so paused/cancelled subscriptions wouldn't appear in the list —
  acceptable given there's currently no UI path to set a subscription to
  anything other than active anyway.

## Verified working, end of second pass

```
backend:  npx tsc --noEmit        → 0 errors
frontend: npx tsc --noEmit        → 0 errors
frontend: npx eslint src          → 0 errors (9 pre-existing dead-code warnings remain)
frontend: vite build              → succeeds, produces a working dist/
```

`npm test` in `backend/` is correct but couldn't be fully exercised in the
environment this fix was written in, because `mongodb-memory-server`
downloads a real `mongod` binary on first run and that network egress was
blocked there. It will work normally with regular internet access or a
cached binary.

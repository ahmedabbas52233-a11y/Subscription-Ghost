<div align="center">

<img src="https://img.shields.io/badge/DocuMind_AI-v2.0.0-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="DocuMind AI v2.0.0" />

# DocuMind AI

**Intelligent document analysis powered by GPT-4o**

Upload any PDF or image — get a structured AI summary, sentiment score, key insights, and actionable recommendations in seconds.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **PDF Extraction** | Selectable text via `pdfplumber` with scanned-page guidance |
| 🖼️ **Image OCR** | Tesseract OCR with automatic Windows path detection and graceful fallback |
| 🤖 **GPT-4o Analysis** | Structured JSON output — summary, sentiment, key points, recommendations |
| 🌊 **SSE Streaming** | Real-time analysis delivery over Server-Sent Events |
| 🔐 **JWT Auth** | Access + refresh token rotation, bcrypt password hashing |
| 📜 **History** | Full paginated document history for authenticated users |
| 👤 **Guest Mode** | Upload and analyse without an account |
| 📱 **Responsive UI** | Mobile-first design, works on all screen sizes |
| ♿ **Accessible** | WCAG 2.1 AA — skip nav, ARIA landmarks, live regions, focus rings |

---

## 🖼️ Screenshots

> Upload → Analyse → Results

```
[ Upload Page ]  →  [ Loading / Streaming ]  →  [ Results Page ]
  Drop zone            Indigo progress bar        Sentiment card
  File preview         GPT-4o processing          Key points list
  Validate & send                                 Recommendations
                                                  Export report
```

---

## 🏗️ Project Structure

```
documind/
├── backend/                   # FastAPI + SQLAlchemy + OpenAI
│   ├── app/
│   │   ├── main.py            # App factory, CORS, routers, lifespan
│   │   ├── config.py          # Pydantic Settings (reads .env)
│   │   ├── database.py        # Async SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py        # User ORM model
│   │   │   └── document.py    # Document ORM model
│   │   ├── schemas/
│   │   │   ├── user.py        # Register / Login schemas + validators
│   │   │   └── document.py    # Upload response schema
│   │   ├── routers/
│   │   │   ├── auth.py        # POST /register /login /refresh GET /me
│   │   │   ├── upload.py      # POST /upload/ (multipart)
│   │   │   ├── analyze.py     # POST /analyze/stream/{id} (SSE)
│   │   │   └── history.py     # GET /history/ DELETE /history/{id}
│   │   └── services/
│   │       ├── security.py    # JWT encode/decode + bcrypt
│   │       └── extractor.py   # PDF + image text extraction
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                  # React 18 + Vite 5 + Tailwind 3
    ├── src/
    │   ├── theme.js           # Central design tokens
    │   ├── api/client.js      # Axios instance + JWT interceptors
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   └── AnalysisContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── FileDropZone.jsx
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── AuthPage.jsx
    │       ├── UploadPage.jsx
    │       ├── AnalysisPage.jsx
    │       └── HistoryPage.jsx
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.11 or 3.12 | **Not 3.13/3.14** — pydantic-core has no wheels yet |
| Node.js | 18+ | LTS recommended |
| PostgreSQL | 14+ | Must be running locally |
| Tesseract | 5.x | Optional — image OCR. See below. |

---

### 1 · Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd documind
```

---

### 2 · Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Create the database:**
```bash
# PostgreSQL must be running
createdb documind

# Or in psql:
# CREATE DATABASE documind;
```

**Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/documind
OPENAI_API_KEY=sk-proj-your-key-here   # leave blank for mock analysis
SECRET_KEY=a-random-string-at-least-32-chars-long
CORS_ORIGINS=http://localhost:5173
```

**Start the backend:**
```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

> Tables are created automatically on startup — no migrations needed.

---

### 3 · Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

### 4 · Image OCR (optional)

DocuMind works without Tesseract — image uploads return metadata and a mock analysis. For real OCR:

**Windows:**
1. Download from https://github.com/UB-Mannheim/tesseract/wiki
2. Install to `C:\Program Files\Tesseract-OCR\`
3. Restart the backend

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt install tesseract-ocr
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel
```

Or connect your GitHub repo at vercel.com and set **Root Directory** to `frontend`.

**Required environment variable in Vercel:**
```
VITE_API_URL = https://your-backend-domain.com/api/v1
```

---

### Backend → Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Set **Root Directory** to `backend`
3. Add a **PostgreSQL** plugin
4. Set environment variables:

```
DATABASE_URL      = (auto-filled by Railway PostgreSQL plugin)
OPENAI_API_KEY    = sk-proj-...
SECRET_KEY        = your-secret
CORS_ORIGINS      = https://your-vercel-app.vercel.app
```

5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

### Backend → Render

1. New Web Service → Connect GitHub repo
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add a **PostgreSQL** database and link it

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Create account |
| `POST` | `/api/v1/auth/login` | — | OAuth2 form login → tokens |
| `POST` | `/api/v1/auth/refresh` | — | Rotate refresh token |
| `GET`  | `/api/v1/auth/me` | Bearer | Current user info |
| `POST` | `/api/v1/upload/` | Optional | Upload file, extract text |
| `POST` | `/api/v1/analyze/stream/{id}` | Optional | SSE analysis stream |
| `GET`  | `/api/v1/history/` | Required | Paginated document history |
| `DELETE` | `/api/v1/history/{id}` | Required | Delete document |
| `GET`  | `/health` | — | Health check |

**SSE event protocol:**

```
event: start
data:

event: result
data: {"analysis":"...","sentiment":"positive","key_points":[...],"recommendations":[...]}

event: done
data:
```

---

## ⚙️ Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | — | ✅ | Async PostgreSQL URL (`postgresql+asyncpg://...`) |
| `OPENAI_API_KEY` | `""` | ⚠️ | GPT-4o-mini key. Mock output if empty. |
| `SECRET_KEY` | `change-me` | ✅ | JWT signing secret (32+ chars) |
| `ALGORITHM` | `HS256` | — | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | — | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | — | Refresh token TTL |
| `MAX_FILE_SIZE` | `5242880` | — | Max upload size in bytes (5 MB) |
| `CORS_ORIGINS` | `http://localhost:5173` | ✅ | Comma-separated allowed origins |

---

## 🧱 Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) 0.115 — async Python API framework
- [SQLAlchemy](https://sqlalchemy.org) 2.0 — async ORM
- [asyncpg](https://github.com/MagicStack/asyncpg) — PostgreSQL async driver
- [OpenAI](https://platform.openai.com) 1.57 — GPT-4o-mini analysis
- [pdfplumber](https://github.com/jsvine/pdfplumber) — PDF text extraction
- [pytesseract](https://github.com/madmaze/pytesseract) + [Pillow](https://pillow.readthedocs.io) — image OCR
- [python-jose](https://github.com/mpdavis/python-jose) — JWT
- [passlib](https://passlib.readthedocs.io) + [bcrypt](https://github.com/pyca/bcrypt) — password hashing

**Frontend**
- [React](https://react.dev) 18 — UI library
- [Vite](https://vitejs.dev) 5 — build tool
- [Tailwind CSS](https://tailwindcss.com) 3 — utility CSS
- [React Router](https://reactrouter.com) 6 — client-side routing
- [Axios](https://axios-http.com) — HTTP client with JWT interceptors
- [Lucide React](https://lucide.dev) — icons
- [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — typography

---

## 📋 WCAG 2.1 AA Compliance

- ✅ Skip navigation link
- ✅ Landmark regions (`main`, `nav`, `footer`, `aside`, `section`)
- ✅ All form inputs have associated `<label>` with `htmlFor`
- ✅ Error messages via `role="alert"` + `aria-describedby`
- ✅ Live regions (`aria-live="polite"`) on streaming status
- ✅ Keyboard accessible drop zone (`role="button"` + `tabIndex`)
- ✅ All icon-only buttons have `aria-label`
- ✅ Visible focus ring (`:focus-visible` 2px indigo outline)
- ✅ Contrast ratios ≥ 4.5:1 on all text (verified against dark backgrounds)
- ✅ No information conveyed by colour alone (icon + text + colour triad)

---

## 📄 License

MIT © 2025 DocuMind AI

---

<div align="center">
Built with ❤️ using FastAPI, React, and OpenAI
</div>

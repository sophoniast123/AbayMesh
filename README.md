# Supply Chain Data Fabric

AI-powered interoperability layer that ingests heterogeneous supply chain data (CSV, Excel, REST), semantically maps source fields to a shared canonical model with human-in-the-loop approval, and surfaces trusted unified data through a dashboard, REST API, and voice interface.

> **Core principle:** _AI suggests. Backend code validates and enforces. Humans approve uncertain mappings._

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS |
| Backend | Python · FastAPI · Pydantic / Pydantic Settings |
| AI Mapping Agent | Google Gemini (`google-genai`) |
| Database & Storage | Supabase (PostgreSQL, Storage) |
| Data Processing | pandas · openpyxl |
| Testing | pytest · httpx |

## Repository Structure

```
.
├── backend/          # FastAPI application (Python)
│   ├── app/
│   │   ├── core/     # Configuration & core setup
│   │   ├── api/      # Route handlers (REST gateway)
│   │   ├── schemas/  # Pydantic models
│   │   └── services/ # Business logic (profiling, mapping, normalization)
│   ├── migrations/   # Database migrations
│   └── requirements.txt
├── frontend/         # Next.js application
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # UI components (layout/, ui/)
│       └── lib/          # API clients & shared utilities
└── docs/             # PRD, architecture, and review documents
```

## Prerequisites

- **Node.js** ≥ 20 and npm
- **Python** ≥ 3.12
- Supabase project credentials and a Gemini API key (see `.env.example` files)

## Local Development

### Backend (FastAPI — http://localhost:8000)

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/Scripts/activate      # Git Bash / Windows
# source .venv/bin/activate        # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env               # then fill in real values

# 4. Run the dev server
uvicorn app.main:app --reload
```

- Health check: <http://localhost:8000/health>
- Interactive API docs: <http://localhost:8000/docs>

### Frontend (Next.js — http://localhost:3000)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local         # then fill in real values

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000> in your browser.

## Documentation

- `docs/PRD.md` — Product Requirements Document

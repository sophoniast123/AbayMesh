# AbayMesh

**AI-Powered Supply Chain Data Interoperability**

AbayMesh connects fragmented supply-chain data — ingesting heterogeneous sources (CSV, Excel, REST), semantically mapping different schemas to a shared canonical model with human-in-the-loop approval, and unifying everything into one trusted data layer.

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
├── frontend/         # AbayMesh web console & landing page
│   └── src/
│       ├── app/          # App Router pages & layouts
│       ├── components/   # brand/, layout/, ui/, feature components
│       └── lib/          # API clients & shared types
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

## Deployment (Vercel)

The frontend deploys to Vercel (`vercel deploy` from `frontend/`, or connect the repo in the Vercel dashboard). Set `NEXT_PUBLIC_API_URL` in the Vercel project environment to the public URL of the FastAPI backend — it is the only environment variable the frontend needs, and no secrets are stored client-side.

## Documentation

- `docs/PRD.md` — Product Requirements Document

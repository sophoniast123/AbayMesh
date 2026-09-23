# Backend — Supply Chain Data Fabric API

FastAPI (Python) backend for the Supply Chain Data Fabric: ingestion, schema
profiling, AI mapping, and canonical inventory APIs.

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/Scripts/activate      # Git Bash / Windows
# source .venv/bin/activate        # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env               # then fill in real values
```

## Run

```bash
uvicorn app.main:app --reload
```

- API root: <http://localhost:8000>
- Health check: <http://localhost:8000/health>
- Interactive docs (Swagger UI): <http://localhost:8000/docs>

## Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py        # FastAPI app, CORS, health route
│   ├── core/          # Settings & core configuration
│   ├── api/           # Route handlers (REST gateway)
│   ├── schemas/       # Pydantic models
│   └── services/      # Business logic (profiling, mapping, normalization)
├── migrations/        # Database migrations
├── requirements.txt
└── .env.example
```

## Environment Variables

See `.env.example`:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key for the AI Mapping Agent |
| `ENVIRONMENT` | `development` / `production` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins |

## Testing

```bash
pytest
```

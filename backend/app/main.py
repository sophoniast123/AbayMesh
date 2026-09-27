"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings

app = FastAPI(
    title="Supply Chain Data Fabric API",
    description=(
        "AI-powered interoperability layer that ingests heterogeneous supply "
        "chain data, maps it to a canonical model, and surfaces trusted "
        "unified data through a REST API."
    ),
    version="0.1.0",
)

# CORS — allow the Next.js frontend origins configured via CORS_ORIGINS
# (defaults to http://localhost:3000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

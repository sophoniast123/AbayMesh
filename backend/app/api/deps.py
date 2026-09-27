"""Shared CRUD helpers for Supabase-backed routers.

Keeps PostgREST error mapping, Supabase errors, and row -> Pydantic
conversion in one place so every router behaves consistently.
"""

from typing import Any, Type, TypeVar

import httpx
from fastapi import HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel, ValidationError

from app.core.supabase import get_supabase_client

ModelT = TypeVar("ModelT", bound=BaseModel)

# Postgres constraint names -> HTTP status. 23505 = unique_violation.
_PG_UNIQUE_VIOLATION = "23505"
# Postgres "relation does not exist" — schema migration not applied.
_PG_MISSING_RELATION = "42P01"


def to_http_exception(exc: Exception) -> HTTPException:
    """Translate Supabase/PostgREST/Pydantic errors into clean HTTP errors."""
    if isinstance(exc, HTTPException):
        return exc
    if isinstance(exc, APIError):
        message = exc.message or "Database operation failed"
        if message == "Invalid path specified in request URL":
            return HTTPException(
                status_code=503,
                detail=(
                    "Supabase URL is misconfigured: SUPABASE_URL must be the "
                    "bare project URL (https://<ref>.supabase.co), not the "
                    "/rest/v1 endpoint."
                ),
            )
        status = 500
        if exc.code == _PG_MISSING_RELATION:
            return HTTPException(
                status_code=503,
                detail=(
                    "Database schema is not initialized. Run "
                    "backend/migrations/001_initial_schema.sql in the "
                    "Supabase SQL editor first."
                ),
            )
        if exc.code == _PG_UNIQUE_VIOLATION:
            status = 409
        elif exc.code and exc.code.startswith("22"):
            status = 400  # data constraint violations (bad values, bad enum)
        elif exc.code and exc.code.startswith("23"):
            status = 400  # FK violations etc.
        detail = message
        if exc.details:
            detail = f"{detail} ({exc.details})"
        return HTTPException(status_code=status, detail=detail)
    if isinstance(exc, ValidationError):
        return HTTPException(status_code=400, detail="Invalid data returned by database")
    if isinstance(exc, RuntimeError):
        # Raised by the Supabase client guard (missing/placeholder credentials)
        return HTTPException(status_code=503, detail=str(exc))
    if isinstance(exc, (httpx.HTTPError, ConnectionError, OSError)):
        # Supabase is unreachable (bad SUPABASE_URL, DNS failure, offline)
        return HTTPException(
            status_code=503,
            detail=(
                "Cannot reach Supabase. Check SUPABASE_URL / "
                "SUPABASE_SERVICE_ROLE_KEY in backend/.env and your network "
                f"connection ({type(exc).__name__})."
            ),
        )
    return HTTPException(
        status_code=500,
        detail=f"Internal server error ({type(exc).__name__})",
    )


def execute_db(query: Any) -> Any:
    """Run a Supabase query, mapping errors to HTTP exceptions."""
    try:
        return query.execute()
    except Exception as exc:  # noqa: BLE001 - single place for error mapping
        raise to_http_exception(exc) from exc


def parse_rows(
    response: Any,
    model: Type[ModelT],
    not_found_detail: str | None = None,
) -> list[ModelT]:
    """Convert Supabase result rows into Pydantic response models.

    Raises 404 when ``not_found_detail`` is given and the result is empty.
    """
    rows = list(getattr(response, "data", None) or [])
    if not_found_detail is not None and not rows:
        raise HTTPException(status_code=404, detail=not_found_detail)
    return [model.model_validate(row) for row in rows]


def db() -> Any:
    """Return the service-role Supabase client (errors mapped to HTTP)."""
    try:
        return get_supabase_client()
    except Exception as exc:  # noqa: BLE001 - single place for error mapping
        raise to_http_exception(exc) from exc


def table(name: str) -> Any:
    """Return a Supabase table query builder via the service-role client."""
    return db().table(name)

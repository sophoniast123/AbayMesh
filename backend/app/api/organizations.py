"""Organization management endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import execute_db, parse_rows, table
from app.schemas.contracts import OrganizationCreate, OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["Organizations"])

_SLUG_FALLBACK = "org"


def slugify(name: str) -> str:
    """Derive a URL-safe slug from an organization name.

    Keeps lowercase letters/digits, collapses runs of separators into single
    hyphens, and trims leading/trailing hyphens.
    """
    slug = ""
    last_was_hyphen = False
    for ch in name.lower().strip():
        if ch.isalnum() and ch.isascii():
            slug += ch
            last_was_hyphen = False
        elif not last_was_hyphen:
            slug += "-"
            last_was_hyphen = True
    slug = slug.strip("-")
    return slug or _SLUG_FALLBACK


def _resolve_slug(payload: OrganizationCreate) -> str:
    """Return the payload slug or generate one from the name."""
    return payload.slug if payload.slug else slugify(payload.name)


def _insert_organization(payload: OrganizationCreate) -> dict[str, Any]:
    """Insert an organization row and return the stored record."""
    row: dict[str, Any] = {"name": payload.name, "slug": _resolve_slug(payload)}
    response = execute_db(table("organizations").insert(row).select("*"))
    rows = list(getattr(response, "data", None) or [])
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Organization was not persisted",
        )
    return rows[0]


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an organization",
)
def create_organization(payload: OrganizationCreate) -> OrganizationResponse:
    """Create an organization; the slug is auto-generated when omitted."""
    org = _insert_organization(payload)
    return OrganizationResponse.model_validate(org)


@router.get(
    "",
    response_model=list[OrganizationResponse],
    summary="List organizations",
)
def list_organizations(
    limit: int = Query(default=100, ge=1, le=200, description="Max rows to return"),
) -> list[OrganizationResponse]:
    """Return organizations ordered by creation time (newest first)."""
    response = execute_db(
        table("organizations")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
    )
    return parse_rows(response, OrganizationResponse)

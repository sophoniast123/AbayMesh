"""Data source management endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import execute_db, parse_rows, table
from app.schemas.contracts import DataSourceCreate, DataSourceResponse

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


def _assert_organization_exists(organization_id: str) -> None:
    """Raise 404 when the referenced organization does not exist."""
    response = execute_db(
        table("organizations")
        .select("id")
        .eq("id", organization_id)
        .limit(1)
    )
    rows = list(getattr(response, "data", None) or [])
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization {organization_id} does not exist",
        )


def _insert_data_source(payload: DataSourceCreate) -> dict[str, Any]:
    """Insert a data source row and return the stored record."""
    row: dict[str, Any] = {
        "organization_id": str(payload.organization_id),
        "name": payload.name,
        "source_type": payload.source_type,
    }
    if payload.schema_fingerprint is not None:
        row["schema_fingerprint"] = payload.schema_fingerprint
    response = execute_db(table("data_sources").insert(row).select("*"))
    rows = list(getattr(response, "data", None) or [])
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Data source was not persisted",
        )
    return rows[0]


@router.post(
    "",
    response_model=DataSourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a data source",
)
def create_data_source(payload: DataSourceCreate) -> DataSourceResponse:
    """Register a CSV/Excel/REST source under an existing organization."""
    _assert_organization_exists(str(payload.organization_id))
    source = _insert_data_source(payload)
    return DataSourceResponse.model_validate(source)


@router.get(
    "",
    response_model=list[DataSourceResponse],
    summary="List data sources",
)
def list_data_sources(
    organization_id: str | None = Query(
        default=None,
        description="Filter data sources by owning organization",
    ),
    limit: int = Query(default=200, ge=1, le=500, description="Max rows to return"),
) -> list[DataSourceResponse]:
    """List data sources, optionally filtered by organization (newest first)."""
    query = table("data_sources").select("*").order("created_at", desc=True)
    if organization_id:
        query = query.eq("organization_id", organization_id)
    response = execute_db(query.limit(limit))
    return parse_rows(response, DataSourceResponse)

"""API request/response contracts (Pydantic v2).

Response models use ``from_attributes=True`` so they can be built directly
from Supabase rows / ORM-like objects. Field names are snake_case and match
the frontend TypeScript contracts in ``frontend/src/lib/types.ts``.
"""

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

SourceType = Literal["csv", "excel", "rest"]

JobStatus = Literal[
    "pending",
    "schema_detected",
    "mapping_pending",
    "approved",
    "processing",
    "completed",
    "failed",
]

MappingStatus = Literal["suggested", "approved", "rejected"]


# ---------------------------------------------------------------------------
# Organizations
# ---------------------------------------------------------------------------
class OrganizationCreate(BaseModel):
    """Request body for creating an organization."""

    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(
        None,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL-safe identifier; generated from name when omitted",
    )


class OrganizationResponse(BaseModel):
    """Organization as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Data Sources
# ---------------------------------------------------------------------------
class DataSourceCreate(BaseModel):
    """Request body for registering a data source under an organization."""

    organization_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    source_type: SourceType
    schema_fingerprint: Optional[dict[str, Any]] = Field(
        None,
        description="Latest profiled schema fingerprint for drift detection",
    )


class DataSourceResponse(BaseModel):
    """Data source as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    name: str
    source_type: SourceType
    schema_fingerprint: dict[str, Any]
    created_at: datetime


# ---------------------------------------------------------------------------
# Ingestion Jobs
# ---------------------------------------------------------------------------
class IngestionJobResponse(BaseModel):
    """Ingestion job lifecycle record as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    data_source_id: UUID
    status: JobStatus
    raw_file_url: Optional[str] = None
    total_records: int = 0
    processed_records: int = 0
    error_summary: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    completed_at: Optional[datetime] = None

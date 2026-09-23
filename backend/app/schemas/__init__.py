"""Pydantic request/response models."""

from app.schemas.canonical import (
    CanonicalInventoryRecord,
    FieldMappingApprovalRequest,
    FieldMappingRule,
)
from app.schemas.contracts import (
    DataSourceCreate,
    DataSourceResponse,
    IngestionJobResponse,
    JobStatus,
    MappingStatus,
    OrganizationCreate,
    OrganizationResponse,
    SourceType,
)

__all__ = [
    # Canonical
    "CanonicalInventoryRecord",
    "FieldMappingApprovalRequest",
    "FieldMappingRule",
    # Contracts
    "DataSourceCreate",
    "DataSourceResponse",
    "IngestionJobResponse",
    "OrganizationCreate",
    "OrganizationResponse",
    # Literal types
    "JobStatus",
    "MappingStatus",
    "SourceType",
]

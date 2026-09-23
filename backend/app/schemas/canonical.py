"""Canonical Pydantic v2 schemas.

The canonical model is the immutable enterprise contract: external supplier
schemas must resolve to these fields before records are trusted and persisted
(PR D 1.3 — "AI suggests. Backend code validates and enforces.").
"""

from datetime import date
from typing import Any, List, Optional

from pydantic import BaseModel, Field, field_validator


class CanonicalInventoryRecord(BaseModel):
    """A validated, normalized inventory record in canonical form."""

    organization_id: str = Field(..., description="UUID of the supplying organization")
    product_id: str = Field(
        ...,
        min_length=1,
        description="Resolved canonical product identifier",
    )
    quantity_available: int = Field(
        ...,
        ge=0,
        description="Available inventory count (non-negative)",
    )
    expected_arrival: Optional[date] = Field(
        None,
        description="Expected shipment date (ISO-8601 YYYY-MM-DD)",
    )
    raw_payload_ref: Optional[dict[str, Any]] = Field(
        None,
        description="Raw source record snapshot for audit and lineage",
    )

    @field_validator("quantity_available", mode="before")
    @classmethod
    def clean_quantity(cls, value: Any) -> Any:
        """Coerce common supplier formats into a whole number.

        Handles values such as ``"1,250"``, ``" 300 "``, and ``300.0``.
        Raises ``ValueError`` for anything that is not a whole number
        (the ``ge=0`` constraint is enforced afterwards by the field).
        """
        if isinstance(value, bool):
            raise ValueError("quantity_available must be a whole number, not a boolean")

        if isinstance(value, str):
            cleaned = value.replace(",", "").strip()
            if not cleaned:
                raise ValueError("quantity_available must not be empty")
            try:
                numeric: Any = float(cleaned)
            except ValueError as exc:
                raise ValueError(
                    f"quantity_available is not a valid number: {value!r}"
                ) from exc
        elif isinstance(value, (int, float)):
            numeric = value
        else:
            raise ValueError(
                f"quantity_available has unsupported type: {type(value).__name__}"
            )

        if isinstance(numeric, float) and not numeric.is_integer():
            raise ValueError(f"quantity_available must be a whole number, got {numeric}")

        return int(numeric)


class FieldMappingRule(BaseModel):
    """A single source-field -> canonical-field mapping suggestion."""

    source_field: str = Field(..., description="Original column header from source")
    target_field: str = Field(..., description="Canonical target field name")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="AI confidence, or 1.0 for a deterministic alias match",
    )
    reason: str = Field(
        ...,
        description="Human-readable justification for the mapping",
    )


class FieldMappingApprovalRequest(BaseModel):
    """Payload submitted by the operator console after human review."""

    approved_mappings: List[FieldMappingRule] = Field(
        ...,
        description="Reviewed field mappings approved (or overridden) by the operator",
    )

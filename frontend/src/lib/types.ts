/**
 * Shared TypeScript contracts for the Supply Chain Data Fabric API.
 *
 * These interfaces mirror the backend Pydantic schemas
 * (backend/app/schemas) 1:1, using snake_case field names. Dates arrive as
 * ISO-8601 strings over the wire.
 */

/** Ingestion job lifecycle states (PRD §4.2). */
export type JobStatus =
  | "pending"
  | "schema_detected"
  | "mapping_pending"
  | "approved"
  | "processing"
  | "completed"
  | "failed";

/** Human-review states for field mappings. */
export type MappingStatus = "suggested" | "approved" | "rejected";

/** Supported data source types. */
export type SourceType = "csv" | "excel" | "rest";

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Data Sources
// ---------------------------------------------------------------------------
export interface DataSource {
  id: string;
  organization_id: string;
  name: string;
  source_type: SourceType;
  schema_fingerprint: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Ingestion Jobs
// ---------------------------------------------------------------------------
export interface IngestionJob {
  id: string;
  data_source_id: string;
  status: JobStatus;
  raw_file_url: string | null;
  total_records: number;
  processed_records: number;
  error_summary: Record<string, unknown>[];
  created_at: string;
  completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Field Mappings
// ---------------------------------------------------------------------------
export interface FieldMapping {
  id: string;
  ingestion_job_id: string;
  source_field: string;
  target_field: string;
  confidence: number;
  reason: string;
  status: MappingStatus;
  is_reviewed: boolean;
  created_at: string;
}

export interface FieldMappingRule {
  source_field: string;
  target_field: string;
  /** 0.0 – 1.0; 1.0 for deterministic alias matches. */
  confidence: number;
  reason: string;
}

export interface FieldMappingApprovalRequest {
  approved_mappings: FieldMappingRule[];
}

// ---------------------------------------------------------------------------
// Canonical Inventory (mirrors CanonicalInventoryRecord in canonical.py)
// ---------------------------------------------------------------------------
export interface CanonicalInventoryRecord {
  organization_id: string;
  product_id: string;
  quantity_available: number;
  expected_arrival: string | null;
  raw_payload_ref: Record<string, unknown> | null;
}

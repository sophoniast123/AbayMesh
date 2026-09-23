# System Architecture & Technical Review Document
## Project: Supply Chain Data Fabric
**Target Audience:** Lead Architects, Backend/Frontend Engineers, AI Coding Agents  
**Scope:** Architecture, Data Schemas, Pipeline Verification, Security Audit & Demo Runbook  

---

## 1. System Architecture Overview

The **Supply Chain Data Fabric** decouples data submission from data consumption. It bridges heterogeneous external supplier data structures into a unified, trusted canonical format using a hybrid pipeline combining deterministic Pandas/Pydantic validation with Gemini-assisted semantic schema mapping.

### 1.1 End-to-End Architectural Data Flow

```
                      +------------------------------------------+
                      |         Data Submission Sources          |
                      |  [Supplier A: CSV]  [Supplier B: XLSX]   |
                      |         [Supplier C: REST API]           |
                      +--------------------+---------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| BACKEND: FASTAPI INGESTION ENGINE                                                 |
|                                                                                   |
|  1. Ingestion Gateway  ---> Raw File Storage (Supabase Storage)                   |
|           |                                                                       |
|  2. Schema Profiler    ---> Extract headers, data types, sample values (Pandas)   |
|           |                                                                       |
|  3. Mapping Engine     ---> [Deterministic Alias Matcher]                         |
|                                     |                                             |
|                               (Ambiguous?)                                        |
|                                     v                                             |
|                             [Gemini API (Structured Outputs)]                     |
|                                     |                                             |
|  4. Approval Gate      <--- Field Mappings staged in PostgreSQL                   |
+-------------------------------------|---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
| FRONTEND: NEXT.JS OPERATOR CONSOLE                                                |
|                                                                                   |
|  - Operator reviews field mappings (Confidence, Reasoning)                        |
|  - Human approves, overrides, or rejects                                          |
|  - Voxide Voice Assistant provides interactive querying & voice confirmations     |
+-------------------------------------|---------------------------------------------+
                                      | (Approved)
                                      v
+-----------------------------------------------------------------------------------+
| BACKEND: CANONICAL TRANSFORMATION & VALIDATION                                    |
|                                                                                   |
|  5. Normalization      ---> Clean dates, format strings, parse numbers            |
|  6. Quality Validator  ---> Enforce Pydantic canonical schema & business rules    |
|  7. Entity Resolver    ---> Match identifiers across supplier catalogs            |
|  8. Data Lineage       ---> Link records to ingestion_jobs & source fields        |
+-------------------------------------|---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
| PERSISTENCE & CONSUMPTION (Supabase PostgreSQL)                                   |
|                                                                                   |
|  - `organizations`        - `data_sources`        - `ingestion_jobs`              |
|  - `field_mappings`       - `products`            - `inventory_records`           |
|  - `audit_events`                                                                 |
|                                                                                   |
|  Consumer Endpoints: Control Tower UI  |  Unified API  |  Voice Assistant         |
+-----------------------------------------------------------------------------------+
```

### 1.2 Core Responsibilities by System Layer

| Component | Technology | Primary Responsibility |
|---|---|---|
| **Frontend Application** | Next.js (App Router), TypeScript, Tailwind CSS | Control Tower dashboard, ingestion management, interactive mapping approval, data lineage exploration. |
| **Voice Interface** | Voxide React SDK (`@voxide/react`) | Client-side voice interaction layer triggering application capabilities and voice-guided mapping confirmations. |
| **Backend & Orchestration**| Python 3.11+, FastAPI, Uvicorn | Gateway endpoints, job lifecycle coordination, business rules, service coordination. |
| **Data Processing Layer** | Pandas, OpenPyXL, Pydantic v2 | Ingestion parsing, schema extraction, profiling, deterministic normalization, and data validation. |
| **AI Mapping Agent** | Google Gemini API (Structured Outputs) | Semantic resolution of ambiguous column headers into canonical schema fields with confidence and reasoning. |
| **Persistence & Files** | Supabase PostgreSQL & Supabase Storage | Relational storage for canonical and audit entities; immutable object storage for raw source files. |

---

## 2. Canonical Data Models & Shared Contracts

The canonical model acts as the immutable enterprise contract. External schemas must resolve to this model before being committed to trusted storage.

### 2.1 Backend Pydantic Schemas (`backend/app/schemas/canonical.py`)

```python
from datetime import date
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, Field, field_validator

class CanonicalInventoryRecord(BaseModel):
    organization_id: str = Field(..., description="UUID of the supplying organization")
    product_id: str = Field(..., min_length=1, description="Resolved canonical product identifier")
    quantity_available: int = Field(..., ge=0, description="Available inventory count (non-negative)")
    expected_arrival: Optional[date] = Field(None, description="Expected shipment date (ISO-8601 YYYY-MM-DD)")
    raw_payload_ref: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Raw source record copy for audit")

    @field_validator("quantity_available", mode="before")
    def clean_quantity(cls, v: Any) -> int:
        if isinstance(v, str):
            clean_str = v.replace(",", "").strip()
            return int(float(clean_str))
        return int(v)

class FieldMappingRule(BaseModel):
    source_field: str = Field(..., description="Original column header from source")
    target_field: str = Field(..., description="Canonical target field name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence or 1.0 for exact alias")
    reason: str = Field(..., description="Human-readable justification for mapping")

class SchemaMappingResponse(BaseModel):
    mappings: List[FieldMappingRule]
```

### 2.2 Frontend TypeScript Contract (`frontend/src/lib/types.ts`)

```typescript
export type JobStatus = 
  | 'pending'
  | 'schema_detected'
  | 'mapping_pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed';

export type MappingStatus = 'suggested' | 'approved' | 'rejected';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface DataSource {
  id: string;
  organization_id: string;
  name: string;
  source_type: 'csv' | 'excel' | 'rest';
  created_at: string;
}

export interface FieldMapping {
  id: string;
  ingestion_job_id: string;
  source_field: string;
  target_field: string;
  confidence: number;
  reason: string;
  status: MappingStatus;
  is_reviewed: boolean;
}

export interface CanonicalInventoryItem {
  id: string;
  organization_id: string;
  product_id: string;
  quantity_available: number;
  expected_arrival: string | null;
  ingestion_job_id: string;
  created_at: string;
}
```

---

## 3. Database Architecture & DDL Migration

The database schema strictly enforces relational integrity, auditability, and full lineage tracking back to raw files.

### 3.1 PostgreSQL DDL (`001_initial_schema.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Data Sources
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('csv', 'excel', 'rest')),
    schema_fingerprint JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ingestion Jobs
CREATE TABLE ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'schema_detected', 'mapping_pending', 'approved', 'processing', 'completed', 'failed')),
    raw_file_url TEXT,
    total_records INT DEFAULT 0,
    processed_records INT DEFAULT 0,
    error_summary JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 4. Field Mappings
CREATE TABLE field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_job_id UUID NOT NULL REFERENCES ingestion_jobs(id) ON DELETE CASCADE,
    source_field VARCHAR(255) NOT NULL,
    target_field VARCHAR(255) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected')),
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Canonical Products (Entity Resolution Target)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    canonical_product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, canonical_product_id)
);

-- 6. Canonical Inventory Records
CREATE TABLE inventory_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    quantity_available INT NOT NULL CHECK (quantity_available >= 0),
    expected_arrival DATE,
    ingestion_job_id UUID NOT NULL REFERENCES ingestion_jobs(id) ON DELETE SET NULL,
    raw_record_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Events
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(50) NOT NULL CHECK (actor IN ('system', 'ai', 'user')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_ds_org ON data_sources(organization_id);
CREATE INDEX idx_jobs_ds ON ingestion_jobs(data_source_id);
CREATE INDEX idx_mappings_job ON field_mappings(ingestion_job_id);
CREATE INDEX idx_inventory_org_prod ON inventory_records(organization_id, product_id);
CREATE INDEX idx_inventory_job ON inventory_records(ingestion_job_id);
```

---

## 4. Ingestion & AI Mapping Engine Deep Dive

```
Raw File Upload -> Profiler -> Deterministic Alias Match -> Gemini Semantic Fallback -> Approval Gate
```

### 4.1 Step 1: Profiling (Deterministic Pandas)
The backend loads the file via Pandas (`chunksize=1000` or raw buffer) and extracts schema metadata without calling an LLM:
- Normalized column headers (`strip().lower()`).
- Inferred types: `int64`, `float64`, `datetime64`, `object`.
- Sample rows: Takes 3 non-null representative values per column.

### 4.2 Step 2: Deterministic Alias Matcher
Before making external network calls, headers are matched against verified aliases:
```python
ALIAS_CATALOG = {
    "product_id": {"sku", "productcode", "product_id", "item_code", "part_number", "item_id"},
    "quantity_available": {"qty", "qty_avail", "available_stock", "stock_on_hand", "quantity", "on_hand"},
    "expected_arrival": {"eta", "expected_delivery", "delivery_date", "arrival_date", "est_arrival"}
}
```
If an exact match is found:
- `target_field` is assigned immediately.
- `confidence` is set to `1.0`.
- `reason` is set to `"Deterministic alias catalog match"`.

### 4.3 Step 3: Gemini Fallback for Ambiguous Fields
Any remaining unmapped columns are dispatched to the Gemini API using Pydantic structured output.

#### Input Payload to Gemini:
```json
{
  "unmapped_columns": [
    {
      "source_name": "BalOnHand",
      "detected_type": "integer",
      "sample_values": [150, 420, 0]
    }
  ],
  "allowed_canonical_targets": [
    "product_id",
    "quantity_available",
    "expected_arrival"
  ]
}
```

#### Gemini Prompt Enforcement:
- System instruction strictly forbids hallucinating or inventing new target fields.
- Target must be chosen exclusively from `allowed_canonical_targets`.
- Must return `confidence` (float 0.0 to 1.0) and `reason`.

#### Backend Validation:
The response is validated against the `SchemaMappingResponse` Pydantic model. Any suggestions attempting to map outside the canonical targets are dropped and flagged for manual assignment.

### 4.4 Step 4: Human Approval Enforcement
Mappings are stored in `field_mappings` with status `suggested`. 
- Transformations are blocked while any mandatory target field is unapproved.
- Operators approve, reject, or manually remap columns in the UI.
- On approval, the ingestion job transitions to `approved`.

---

## 5. Normalization, Validation, and Lineage

### 5.1 Normalization Pipeline
1. **Header Mapping:** Rename source DataFrame columns according to approved mappings.
2. **Numeric Cleaning:** Strip commas, currency symbols, and spaces; cast to integer.
3. **Date Parsing:** Standardize diverse date strings (`MM/DD/YYYY`, `YYYY.MM.DD`, timestamps) into ISO-8601 (`YYYY-MM-DD`).
4. **Product Code Normalization:** Strip whitespace and convert to uppercase (`P-1001 ` $\rightarrow$ `P-1001`).

### 5.2 Quality Rules & Rejection Logic
- Rows missing `product_id` are rejected immediately.
- Rows where `quantity_available < 0` are rejected.
- Invalid rows are logged in `ingestion_jobs.error_summary` with row index and error detail.
- Valid rows are inserted into `inventory_records` in a single transaction.

### 5.3 Data Lineage Architecture
Every row in `inventory_records` stores:
- `ingestion_job_id`: Relates to the exact execution that parsed the file.
- `raw_record_payload`: A JSONB snapshot of the raw row as it arrived from the supplier.
- Data lineage API (`GET /api/v1/lineage/{record_id}`) joins `inventory_records` $\rightarrow$ `ingestion_jobs` $\rightarrow$ `data_sources` $\rightarrow$ `organizations` and `field_mappings` to show the full provenance chain.

---

## 6. Voice AI Integration Architecture (Voxide)

Voxide is implemented strictly in the frontend layer via `@voxide/react`. It operates as a voice-to-action controller and does not possess direct database access.

### 6.1 Architecture Flow
```
[User Voice/Text] 
       |
       v
[Voxide SDK Client] ---> Matches registered capability
                               |
                               v
               [Frontend Capability Handler]
                               | (Calls authenticated REST endpoint)
                               v
                    [FastAPI Backend]
                               | (Returns JSON data)
                               v
               [Handler returns text result to Voxide]
                               |
                               v
             [Voxide speaks / displays answer to User]
```

### 6.2 Registered Capabilities

| Capability Name | Type | Action | Safety Guardrail |
|---|---|---|---|
| `navigateTo` | Navigation | Moves Next.js router to target page (`/inventory`, `/mappings`). | None required. |
| `getInventory` | Read-only | Fetches canonical inventory summary for a SKU. | None required. |
| `getDataQualityIssues` | Read-only | Returns rejected row counts and reasons for current job. | None required. |
| `explainMapping` | Read-only | Reads aloud the AI reason and confidence for a column. | None required. |
| `approveMapping` | Mutating | Triggers mapping approval for the active ingestion job. | **Requires explicit verbal or visual confirmation.** |

---

## 7. Security, Secrets & Threat Modeling

| Attack Surface / Risk | Threat | Mitigation Strategy |
|---|---|---|
| **Secret Leakage** | Gemini API key or Supabase Service Role key leaked in browser bundle. | Frontend contains **only** `NEXT_PUBLIC_API_URL`. All external AI calls, storage writes, and database operations execute via FastAPI backend. |
| **Prompt Injection** | Malicious CSV column headers attempt prompt injection against mapping LLM. | Source headers and samples are serialized into inert JSON values within strict structured schema arguments. The LLM is never evaluated against raw unstructured instructions. |
| **Data Poisoning** | False AI mappings corrupt trusted canonical database records. | Strict approval gate: The backend transformation routine asserts `job.status == 'approved'` before writing records to `inventory_records`. |
| **Unbounded File Ingestion** | DoS via massive multi-gigabyte files. | Backend limits upload size to 15 MB. Files are processed with row batch bounds (max 10,000 records for the prototype). |

---

## 8. Implementation Risk & Fallback Matrix

| Risk Event | Severity | Fallback Architecture |
|---|---|---|
| **Gemini Outage / Rate Limit** | High | System falls back to deterministic alias matching. Unmatched columns are presented with confidence `0.0` and a dropdown for manual selection. |
| **Malformed Excel Files (`.xlsx`)** | Medium | OpenPyXL is configured with `data_only=True` to strip calculated formulas and extract cached values. Falls back to raw CSV export instructions. |
| **Voxide WebRTC / Mic Drop** | Low | All voice capabilities are non-exclusive mirrors of UI actions. The operator can perform all actions using standard mouse clicks. |
| **Complex Identifier Variations** | Low | Entity resolution uses exact match and case-insensitive trimming. Unmatched identifiers are added as new product entities rather than failing the job. |

---

## 9. 3-Minute Live Hackathon Demo Runbook

### Scene 1: The Multi-Supplier Problem (0:00 – 0:30)
- **Visual:** Dashboard shows empty canonical inventory.
- **Narrative:** "Supply chains are fragmented. Supplier A uses Excel with `Qty Available`, Supplier B uses CSV with `Available_Stock`, and Supplier C exposes a REST API with `stock_on_hand`. Traditional systems take weeks to build custom connectors for each."

### Scene 2: Ingestion & Schema Profiling (0:30 – 1:00)
- **Action:** Select "Supplier A", drag-and-drop `supplier_a_inventory.xlsx`.
- **System Action:** Ingestion gateway uploads file to Supabase Storage, creates ingestion job, profiles schema headers, and runs the hybrid mapping engine.

### Scene 3: AI Mapping & Human Review (1:00 – 1:30)
- **Visual:** Mapping Review screen renders automatically.
- **Key Display:**
  - `SKU` $\rightarrow$ `product_id` (100% - Deterministic alias)
  - `Qty Available` $\rightarrow$ `quantity_available` (100% - Deterministic alias)
  - `ETA` $\rightarrow$ `expected_arrival` (100% - Deterministic alias)
  - `VendorNotes` $\rightarrow$ Flagged as unmapped / optional.
- **Action:** Operator reviews and clicks **Approve Mappings**.

### Scene 4: Normalization & Validation (1:30 – 2:00)
- **Visual:** System processes records deterministically.
- **Key Display:** Unified Inventory table updates with Supplier A's data. 
- **Validation Highlight:** Switch to Data Quality tab showing 1 record rejected with error: `quantity_available must be >= 0 (received -15)`.

### Scene 5: Multi-Source Unification & Lineage (2:00 – 2:30)
- **Action:** Simulate fast-ingest of Supplier B (CSV) and Supplier C (REST).
- **Visual:** Inventory table aggregates stock for `P-1001` across all three suppliers.
- **Action:** Click `P-1001` to open the **Data Lineage Drawer**, showing the exact source file, ingestion job ID, raw payload, and approved mapping rule.

### Scene 6: Hands-Free Voice Control via Voxide (2:30 – 3:00)
- **Action:** Activate the Voxide voice widget.
- **Voice Prompt:** *"Voxide, what is our total available inventory for Product P-1001?"*
- **Voice Output:** Voxide announces: *"Total available inventory for Product P-1001 across all suppliers is 720 units."*
- **Closing Statement:** *"We did not require external suppliers to change their formats. We built a trusted, AI-assisted interoperability layer where AI suggests, code validates, and humans retain full control."*
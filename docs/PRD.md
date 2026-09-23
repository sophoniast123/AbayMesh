# Product Requirements Document (PRD)
## Project: Supply Chain Data Fabric
**Version:** 1.0.0  
**Timeline:** 20-Day Hackathon Prototype  
**Team:** 2 Engineers (Backend/AI Lead & Frontend/Product Lead)  
**Status:** Approved for Implementation

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Supply chain networks are fundamentally fragmented. Organizations exchange critical operational data (inventory, orders, supplier delivery schedules) using incompatible formats and terminology:
- Supplier A transmits Excel files with columns `Qty Available` and `ETA`.
- Supplier B provides CSV files with columns `Available_Stock` and `ExpectedDelivery`.
- Supplier C exposes a REST endpoint returning JSON with `stock_on_hand` and `arrival_date`.

Traditionally, integrating these heterogeneous sources requires weeks of brittle, manual point-to-point ETL scripting. When a supplier updates column headers, pipelines break silently.

### 1.2 Solution
The **Supply Chain Data Fabric** is an AI-powered interoperability layer that ingests heterogeneous supply chain data in its original format, uses an AI Mapping Agent to semantically map source fields to a shared canonical model, enforces human-in-the-loop review, validates and normalizes the records deterministically, and surfaces trusted unified data through a real-time dashboard, REST API, and voice interface (Voxide).

### 1.3 Core Operating Principle
> **"AI suggests. Backend code validates and enforces. Humans approve uncertain mappings."**  
The system will never allow unverified LLM predictions to mutate production data directly.

---

## 2. Project Goals & Non-Goals

### 2.1 Goals (In Scope - MVP)
1. **Multi-Source Ingestion:** Ingest CSV, Excel (`.xlsx`), and REST API payloads from distinct organizations.
2. **Deterministic Schema Profiling:** Extract headers, infer primitive data types, compute null ratios, and capture representative row samples without calling an LLM.
3. **Hybrid Mapping Pipeline:** Perform instant rule-based alias matching; route ambiguous fields to Gemini structured output to predict mappings with confidence scores and reasoning.
4. **Human-in-the-Loop Approval:** Interactive UI enabling data operators to inspect, edit, approve, or reject field mappings before transformation.
5. **Deterministic Normalization & Quality Checks:** Clean dates, parse numeric values, strip whitespace, and reject invalid records (e.g., negative quantities, malformed dates) using Pydantic.
6. **Unified Inventory & Data Lineage:** Persist clean records into a canonical database schema where every record links back to its source ingestion job and original raw file.
7. **Basic Schema-Change Detection:** Detect header drift or renamed columns on re-ingestion, trigger schema-change alerts, and request remapping.
8. **Voice Agent (Voxide):** Enable hands-free querying of inventory, data quality summaries, mapping explanations, and voice-prompted mapping confirmations.

### 2.2 Non-Goals (Strictly Out of Scope)
- Autonomous procurement, purchase order dispatch, or multi-agent supplier negotiation.
- Direct enterprise ERP connectors (e.g., SAP NetWeaver, Oracle Fusion, Salesforce).
- Real-time event streaming architectures (Kafka, Flink, RabbitMQ) or IoT telemetry.
- Supply chain algorithmic optimization (route routing, safety stock simulations, ML demand forecasting).
- Training custom LLMs or fine-tuning foundation models.

---

## 3. Personas & User Stories

### 3.1 Primary Personas
- **Supply Chain Integration Manager (Sarah):** Oversees external supplier integrations, reviews schema discrepancies, and audits data hygiene.
- **Logistics Operations Analyst (Alex):** Queries stock balances across multi-tier suppliers to resolve delivery bottlenecks.

### 3.2 User Stories
| ID | As a... | I want to... | So that I can... |
|---|---|---|---|
| **US-01** | Integration Manager | Upload arbitrary CSV or Excel sheets from any supplier | Ingest inventory without asking vendors to conform to a custom format. |
| **US-02** | Integration Manager | Review AI-suggested mappings with confidence ratings | Catch hallucinations or false mappings before bad data corrupts our systems. |
| **US-03** | Integration Manager | See immediate validation errors when vendor records are corrupted | Identify supplier compliance issues instantly. |
| **US-04** | Operations Analyst | Search canonical inventory across all vendors simultaneously | Find out total available stock for critical parts in real time. |
| **US-05** | Operations Analyst | Trace any canonical field back to its raw file and ingestion job | Audit the source of truth if numbers disagree. |
| **US-06** | Operations Analyst | Ask via voice: *"What is our total stock for SKU P-1001?"* | Retrieve answers hands-free during operations calls. |

---

## 4. Functional Specifications

### 4.1 Organizations & Data Sources
- The system must maintain strict logical separation between an **Organization** (e.g., *Gebeta Manufacturing*) and a **Data Source** (e.g., *Daily Factory Inventory XLSX*).
- An organization can own $N$ distinct data sources across CSV, Excel, or REST types.

### 4.2 Ingestion Engine
- **File Upload:** Support `.csv` and `.xlsx` up to 15 MB. Files are stored immutably in Supabase Storage (`/raw-uploads/{org_id}/{job_id}/filename.ext`).
- **REST Gateway:** Authenticated endpoint accepting JSON payloads (`POST /api/v1/ingestion/organizations/{id}/data`).
- **Ingestion Job Lifecycle:** Every submission instantiates a record in `ingestion_jobs` transitioning through:
  `pending` $\rightarrow$ `schema_detected` $\rightarrow$ `mapping_pending` $\rightarrow$ `approved` $\rightarrow$ `processing` $\rightarrow$ `completed` (or `failed`).

### 4.3 Schema Profiling & AI Mapping
- **Profiler:** Backend (Pandas) reads raw files and outputs a column metadata manifest:
  - Column name, inferred data type (integer, float, string, date), non-null count, and 3 representative sample values.
- **Mapping Pipeline:**
  1. *Rule Matcher:* Checks exact and known normalized aliases (e.g., `qty_avail`, `stock_on_hand` $\rightarrow$ `quantity_available`).
  2. *Gemini AI Agent:* Ambiguous fields are submitted with column samples and canonical target schema to Gemini via structured JSON schema enforcement.
  3. AI must return: `target_field`, `confidence` (float 0.0–1.0), and `reason` (string explaining the decision).
  4. The model is forbidden from inventing target schema fields.

### 4.4 Human-in-the-Loop Approval UI
- Review table displays: `Source Field` | `Sample Values` | `Suggested Canonical Field` | `Confidence Badge` | `AI Reasoning` | `Action (Approve / Override / Reject)`.
- Users can override target field via a dropdown of available canonical fields.
- Submitting approval marks the job status as `approved` and unlocks normalization.

### 4.5 Normalization, Validation, and Canonical Storage
- Transformations execute via deterministic Python routines (Pandas/Pydantic):
  - Strip whitespace, cast numeric strings to integers/floats, format dates to ISO-8601 (`YYYY-MM-DD`).
- Reject records violating domain rules:
  - `quantity_available < 0` $\rightarrow$ Flagged as validation error.
  - Missing `product_id` $\rightarrow$ Record dropped with error entry.
- Clean records are inserted into `inventory_records` with a link to `ingestion_jobs.id`.

### 4.6 Data Lineage & Schema Drift Tracking
- Every canonical inventory row maintains an immutable pointer to `ingestion_job_id` and the raw source column mapping.
- Re-ingesting a data source runs a fingerprint check against prior schema versions. Any detected missing or novel columns trigger a `Schema Change Alert`.

### 4.7 Voice Interface (Voxide React SDK)
- Persistently mounted floating widget allowing voice/text commands.
- Registered capabilities:
  - Navigation (`navigateTo`)
  - Inventory balance inquiry (`getInventory`)
  - Validation check summary (`getDataQualityIssues`)
  - Mapping explanation (`explainMapping`)
  - Approval trigger (`approveMapping`) — **requires mandatory verbal or visual confirmation guardrail**.

---

## 5. Non-Functional Requirements

| Category | Requirement | Verification Method |
|---|---|---|
| **Security** | Zero client-side API keys; all Gemini and Supabase service keys live in backend `.env`. | Automated security linter; frontend bundle inspection. |
| **Performance** | Ingest, profile, and suggest mappings for a 5,000-row file in $\le 5$ seconds. | End-to-end load test. |
| **Reliability** | Deterministic pipeline crash tolerance: bad rows never halt an entire job. | Fault injection tests (malformed dates, null values). |
| **Traceability** | 100% of persisted canonical inventory records must link to an ingestion job ID. | PostgreSQL Foreign Key constraint audit. |

---

## 6. Success Metrics for Hackathon Demo
1. **End-to-End Execution:** Clean demonstration within 3 minutes ingesting datasets from 3 simulated suppliers (CSV, Excel, REST) into a unified inventory dashboard.
2. **AI Mapping Accuracy:** Gemini identifies semantically complex field names with $\ge 90\%$ initial accuracy across test datasets.
3. **Data Integrity:** 0 invalid/unapproved records written to the canonical table.
4. **Interactive Lineage:** Operator can click any dashboard record and view its original file, ingestion timestamp, and approval log.
5. **Voxide Voice Capability:** Operator can successfully execute at least 2 queries and 1 mapping confirmation hands-free.
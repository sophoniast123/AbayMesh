-- ============================================================================
-- 001_initial_schema.sql
-- Supply Chain Data Fabric — initial schema (7 core tables)
--
-- Target: Supabase PostgreSQL (15+). gen_random_uuid() is built in (PG13+),
-- so no extensions are required.
--
-- Lineage guarantee (PRD §4.6): every canonical inventory row links back to
-- its ingestion job and keeps a JSONB snapshot of the raw source record.
--
-- Security model (PRD §5): the FastAPI backend connects exclusively with the
-- service_role key. RLS is enabled on every table and explicit policies grant
-- full access to `service_role`; no policies exist for anon/authenticated,
-- so those roles can read nothing even if their grants are ever widened.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Organizations
-- ----------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh on every UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_set_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Data Sources (an organization owns N sources across CSV/Excel/REST)
-- ----------------------------------------------------------------------------
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('csv', 'excel', 'rest')),
    schema_fingerprint JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Ingestion Jobs (pending -> schema_detected -> mapping_pending ->
--    approved -> processing -> completed | failed)
-- ----------------------------------------------------------------------------
CREATE TABLE ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'schema_detected', 'mapping_pending',
            'approved', 'processing', 'completed', 'failed'
        )
    ),
    raw_file_url TEXT,
    total_records INT NOT NULL DEFAULT 0,
    processed_records INT NOT NULL DEFAULT 0,
    error_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 4. Field Mappings (AI suggestions gated by human approval)
-- ----------------------------------------------------------------------------
CREATE TABLE field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_job_id UUID NOT NULL REFERENCES ingestion_jobs(id) ON DELETE CASCADE,
    source_field VARCHAR(255) NOT NULL,
    target_field VARCHAR(255) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'suggested' CHECK (
        status IN ('suggested', 'approved', 'rejected')
    ),
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Canonical Products (entity-resolution target)
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    canonical_product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, canonical_product_id)
);

-- ----------------------------------------------------------------------------
-- 6. Canonical Inventory Records (trusted, unified stock levels)
--    Note: ingestion_job_id is nullable with ON DELETE SET NULL so that
--    canonical data survives job deletion; new jobs must re-link lineage.
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    quantity_available INT NOT NULL CHECK (quantity_available >= 0),
    expected_arrival DATE,
    ingestion_job_id UUID REFERENCES ingestion_jobs(id) ON DELETE SET NULL,
    raw_record_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. Audit Events (polymorphic, append-only trail: actor system | ai | user)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(50) NOT NULL CHECK (actor IN ('system', 'ai', 'user')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Performance indexes
-- (Postgres auto-indexes PKs and UNIQUE constraints; FKs are NOT auto-indexed.
--  products(organization_id) lookups are served by the UNIQUE constraint
--  index, so no extra index is needed there.)
-- ============================================================================

CREATE INDEX idx_data_sources_organization_id ON data_sources(organization_id);

CREATE INDEX idx_ingestion_jobs_data_source_id ON ingestion_jobs(data_source_id);
CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_created_at ON ingestion_jobs(created_at);

CREATE INDEX idx_field_mappings_ingestion_job_id ON field_mappings(ingestion_job_id);
CREATE INDEX idx_field_mappings_status ON field_mappings(status);

CREATE INDEX idx_inventory_records_org_product ON inventory_records(organization_id, product_id);
CREATE INDEX idx_inventory_records_ingestion_job_id ON inventory_records(ingestion_job_id);
CREATE INDEX idx_inventory_records_expected_arrival ON inventory_records(expected_arrival);

CREATE INDEX idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

-- ============================================================================
-- Row Level Security — service_role full access, everyone else: nothing
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_on_organizations"
    ON organizations FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_data_sources"
    ON data_sources FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_ingestion_jobs"
    ON ingestion_jobs FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_field_mappings"
    ON field_mappings FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_products"
    ON products FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_inventory_records"
    ON inventory_records FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_on_audit_events"
    ON audit_events FOR ALL TO service_role
    USING (true) WITH CHECK (true);

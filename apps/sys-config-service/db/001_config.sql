-- Apply as the migration owner inside a dedicated config database.
BEGIN;
CREATE SCHEMA catalog;
CREATE TABLE catalog.configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid, key text NOT NULL CHECK(key ~ '^[A-Za-z0-9._-]{1,128}$'),
  canonical_key text GENERATED ALWAYS AS (lower(key COLLATE "C")) STORED,
  revision uuid NOT NULL DEFAULT gen_random_uuid(),content bytea NOT NULL CHECK(octet_length(content) BETWEEN 1 AND 20971520),
  mime text NOT NULL,encoding text NOT NULL,refer text NOT NULL DEFAULT 'GEOHUB',group_name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '', public boolean NOT NULL DEFAULT false,active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (tenant_id,canonical_key)
);
CREATE TABLE catalog.audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid,actor_id uuid NOT NULL,action text NOT NULL,
  key text NOT NULL,revision uuid NOT NULL,occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION catalog.tenant() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('rms.tenant_id',true),'')::uuid$$;
CREATE FUNCTION catalog.shared_writer() RETURNS boolean LANGUAGE sql STABLE AS $$SELECT current_setting('rms.catalog_scope',true)='shared'$$;
CREATE FUNCTION catalog.writable(owner_id uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN catalog.shared_writer() THEN owner_id IS NULL
  ELSE current_setting('rms.catalog_scope',true)='tenant' AND owner_id=catalog.tenant() END
$$;
ALTER TABLE catalog.configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.configuration FORCE ROW LEVEL SECURITY;
CREATE POLICY config_read ON catalog.configuration FOR SELECT TO rms_config_runtime
  USING(catalog.tenant() IS NOT NULL AND (tenant_id IS NULL OR (NOT catalog.shared_writer() AND tenant_id=catalog.tenant())));
CREATE POLICY config_insert ON catalog.configuration FOR INSERT TO rms_config_runtime WITH CHECK(catalog.writable(tenant_id));
CREATE POLICY config_update ON catalog.configuration FOR UPDATE TO rms_config_runtime USING(catalog.writable(tenant_id)) WITH CHECK(catalog.writable(tenant_id));
CREATE POLICY config_delete ON catalog.configuration FOR DELETE TO rms_config_runtime USING(catalog.writable(tenant_id));
ALTER TABLE catalog.audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.audit FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_append ON catalog.audit FOR INSERT TO rms_config_runtime WITH CHECK(catalog.writable(tenant_id));
GRANT USAGE ON SCHEMA catalog TO rms_config_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON catalog.configuration TO rms_config_runtime;
GRANT INSERT ON catalog.audit TO rms_config_runtime;
CREATE INDEX configuration_group ON catalog.configuration(tenant_id,group_name);
CREATE INDEX configuration_refer ON catalog.configuration(tenant_id,refer);
COMMIT;

BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE SCHEMA rms AUTHORIZATION rms_migrate;
GRANT USAGE ON SCHEMA rms TO rms_runtime;

CREATE FUNCTION rms.current_tenant() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('rms.tenant_id', true), '')::uuid;
$$;

CREATE TABLE rms.tenant (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  issuer text UNIQUE NOT NULL
);
CREATE TABLE rms.unit (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),
  id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  PRIMARY KEY (tenant_id, id)
);
CREATE TABLE rms.research_project (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),
  id uuid NOT NULL,
  unit_id uuid NOT NULL,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, unit_id) REFERENCES rms.unit(tenant_id, id)
);

ALTER TABLE rms.tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.tenant FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_self ON rms.tenant TO rms_runtime USING (id = rms.current_tenant());
CREATE POLICY tenant_provision ON rms.tenant TO rms_migrate USING (true) WITH CHECK (true);
GRANT SELECT ON rms.tenant TO rms_runtime;

ALTER TABLE rms.unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.unit FORCE ROW LEVEL SECURITY;
CREATE POLICY unit_isolation ON rms.unit TO rms_runtime
  USING (tenant_id = rms.current_tenant()) WITH CHECK (tenant_id = rms.current_tenant());

ALTER TABLE rms.research_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.research_project FORCE ROW LEVEL SECURITY;
CREATE POLICY project_isolation ON rms.research_project TO rms_runtime
  USING (tenant_id = rms.current_tenant()) WITH CHECK (tenant_id = rms.current_tenant());
GRANT SELECT, INSERT, UPDATE, DELETE ON rms.unit, rms.research_project TO rms_runtime;
COMMIT;

BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.theme_release (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id), revision integer NOT NULL CHECK(revision>1),
  tokens jsonb NOT NULL, source_revision integer, actor_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,revision), FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id)
);
CREATE TABLE rms.theme_draft (
  tenant_id uuid PRIMARY KEY REFERENCES rms.tenant(id), serial integer NOT NULL CHECK(serial>0),
  based_on integer NOT NULL CHECK(based_on>=1), tokens jsonb NOT NULL, actor_id uuid NOT NULL,
  FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.theme_release ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.theme_release FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.theme_release TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
ALTER TABLE rms.theme_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.theme_draft FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.theme_draft TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT ON rms.theme_release TO rms_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON rms.theme_draft TO rms_runtime;
COMMIT;

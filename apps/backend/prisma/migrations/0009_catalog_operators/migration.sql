BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.catalog_operator (
  tenant_id uuid NOT NULL, account_id uuid NOT NULL, PRIMARY KEY(tenant_id,account_id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.catalog_operator ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.catalog_operator FORCE ROW LEVEL SECURITY;
CREATE POLICY operator_read ON rms.catalog_operator FOR SELECT TO rms_runtime USING(tenant_id=rms.current_tenant());
CREATE POLICY operator_provision ON rms.catalog_operator TO rms_migrate
  USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT ON rms.catalog_operator TO rms_runtime;
COMMIT;

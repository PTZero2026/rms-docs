BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.extension_member (
  tenant_id uuid NOT NULL, entry_id uuid NOT NULL, account_id uuid NOT NULL,
  share integer NOT NULL CHECK (share BETWEEN 1 AND 99),
  PRIMARY KEY (tenant_id,entry_id,account_id),
  FOREIGN KEY (tenant_id,entry_id) REFERENCES rms.extension_entry(tenant_id,id),
  FOREIGN KEY (tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.extension_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.extension_member FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.extension_member TO rms_runtime
  USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,DELETE ON rms.extension_member TO rms_runtime;
COMMIT;

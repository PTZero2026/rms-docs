BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.professional_profile (
 tenant_id uuid NOT NULL,account_id uuid NOT NULL,data jsonb NOT NULL DEFAULT '{}',PRIMARY KEY(tenant_id,account_id),
 FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.professional_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.professional_profile FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.professional_profile TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(data) ON rms.professional_profile TO rms_runtime;
COMMIT;

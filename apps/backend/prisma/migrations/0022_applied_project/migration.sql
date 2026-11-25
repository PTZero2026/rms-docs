BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.applied_project (
  tenant_id uuid NOT NULL, id uuid NOT NULL, unit_id uuid NOT NULL, owner_id uuid NOT NULL, title text NOT NULL,
  total_budget_vnd bigint NOT NULL CHECK(total_budget_vnd>=0),partners text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PENDING','APPROVED')),revision integer NOT NULL DEFAULT 1,
  PRIMARY KEY(tenant_id,id), FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),FOREIGN KEY(tenant_id,owner_id) REFERENCES rms.account(tenant_id,id)
);
CREATE INDEX applied_scope ON rms.applied_project(tenant_id,unit_id,status);
ALTER TABLE rms.applied_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.applied_project FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.applied_project TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT INSERT,SELECT,UPDATE(title,unit_id,total_budget_vnd,partners,status,revision) ON rms.applied_project TO rms_runtime;
COMMIT;

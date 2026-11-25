BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.student_directory (
  tenant_id uuid NOT NULL,account_id uuid NOT NULL,kind text NOT NULL CHECK(kind IN ('STUDENT','MENTOR')),
  PRIMARY KEY(tenant_id,account_id),FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
CREATE TABLE rms.student_project (
  tenant_id uuid NOT NULL,id uuid NOT NULL,unit_id uuid NOT NULL,leader uuid NOT NULL,mentor_id uuid NOT NULL,members uuid[] NOT NULL,
  title text NOT NULL,call_code text NOT NULL,mentor_state text NOT NULL DEFAULT 'INVITED' CHECK(mentor_state IN ('INVITED','ACCEPTED','DECLINED','RETURNED')),
  reason text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED')),
  PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),
  FOREIGN KEY(tenant_id,leader) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,mentor_id) REFERENCES rms.account(tenant_id,id),
  CHECK(leader=ANY(members) AND NOT mentor_id=ANY(members))
);
ALTER TABLE rms.student_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.student_project FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.student_project TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
ALTER TABLE rms.student_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.student_directory FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.student_directory TO rms_runtime USING(tenant_id=rms.current_tenant());
GRANT SELECT ON rms.student_directory TO rms_runtime;
GRANT SELECT,INSERT,UPDATE(status,mentor_state,reason,mentor_id,members,title,call_code) ON rms.student_project TO rms_runtime;
COMMIT;

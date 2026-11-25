BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.author_request (
  tenant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  application jsonb NOT NULL, status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, reviewed_by uuid, admin_note text NOT NULL DEFAULT '',
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,user_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY (tenant_id,reviewed_by) REFERENCES rms.account(tenant_id,id),
  CHECK ((reviewed_at IS NULL) = (status = 'PENDING') AND (reviewed_by IS NULL) = (status = 'PENDING')),
  CHECK (status <> 'REJECTED' OR btrim(admin_note) <> '')
);
CREATE UNIQUE INDEX author_request_pending ON rms.author_request(tenant_id,user_id) WHERE status='PENDING';
CREATE INDEX author_request_queue ON rms.author_request(tenant_id,status,created_at,id);
ALTER TABLE rms.author_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.author_request FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.author_request TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(status,reviewed_at,reviewed_by,admin_note) ON rms.author_request TO rms_runtime;
COMMIT;

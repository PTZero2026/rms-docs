BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.evaluation_round ADD COLUMN decision_revision integer NOT NULL DEFAULT 0 CHECK (decision_revision>=0);
GRANT UPDATE(decision_revision) ON rms.evaluation_round TO rms_runtime;
CREATE TABLE rms.round_amendment (
  tenant_id uuid NOT NULL, round_id uuid NOT NULL, revision integer NOT NULL CHECK (revision>0),
  action text NOT NULL CHECK (action IN ('REOPEN','REFER')),
  reason text NOT NULL CHECK (length(trim(reason)) BETWEEN 1 AND 2000),
  actor_id uuid NOT NULL, recipient_id uuid, audit_id uuid NOT NULL,
  conclusion text NOT NULL, decision jsonb NOT NULL, ethics text NOT NULL, ethics_note text,
  project_status rms.project_semantic NOT NULL, concluded_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id,round_id,revision),
  UNIQUE (tenant_id,round_id,concluded_at),
  CHECK ((action='REFER')=(recipient_id IS NOT NULL)),
  FOREIGN KEY (tenant_id,round_id) REFERENCES rms.evaluation_round(tenant_id,id),
  FOREIGN KEY (tenant_id,actor_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY (tenant_id,recipient_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY (tenant_id,audit_id) REFERENCES rms.audit_log(tenant_id,id)
);
ALTER TABLE rms.round_amendment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.round_amendment FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.round_amendment TO rms_runtime
  USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant());
GRANT SELECT,INSERT ON rms.round_amendment TO rms_runtime;
INSERT INTO rms.notice_kind VALUES ('ROUND_CORRECTION_REQUESTED','Có yêu cầu đính chính kết luận hội đồng',false,true);
COMMIT;

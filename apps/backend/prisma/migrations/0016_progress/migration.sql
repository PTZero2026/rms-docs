BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.attachment_intent ADD UNIQUE(tenant_id,project_id,id);
ALTER TABLE rms.proposal_document ADD COLUMN promised_products jsonb NOT NULL DEFAULT '{}';
CREATE TABLE rms.project_assignment (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,reference text NOT NULL,signed date NOT NULL,effective date NOT NULL CHECK(effective>=signed),
  starts date NOT NULL,ends date NOT NULL CHECK(ends>=starts),budget bigint NOT NULL CHECK(budget BETWEEN 1 AND 9007199254740991),
  note text NOT NULL,commitments jsonb NOT NULL,file_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,project_id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,project_id,file_id) REFERENCES rms.attachment_intent(tenant_id,project_id,id)
);
CREATE TABLE rms.progress_period (
  tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),project_id uuid NOT NULL,period integer NOT NULL CHECK(period>0),
  due_date date NOT NULL,status text NOT NULL DEFAULT 'PENDING_SUBMISSION' CHECK(status IN ('PENDING_SUBMISSION','SUBMITTED','PASSED','REVISION_REQUESTED')),
  submitted_at timestamptz,content text,officer_comment text,file_id uuid,revision integer NOT NULL DEFAULT 0,
  PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,project_id,period),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,project_id,file_id) REFERENCES rms.attachment_intent(tenant_id,project_id,id)
);
CREATE INDEX progress_due ON rms.progress_period(tenant_id,due_date,project_id) WHERE status IN ('PENDING_SUBMISSION','REVISION_REQUESTED');
CREATE TABLE rms.progress_submission (
  tenant_id uuid NOT NULL,period_id uuid NOT NULL,revision integer NOT NULL,author_id uuid NOT NULL,submitted_at timestamptz NOT NULL,
  content text NOT NULL,file_id uuid NOT NULL,PRIMARY KEY(tenant_id,period_id,revision),
  FOREIGN KEY(tenant_id,period_id) REFERENCES rms.progress_period(tenant_id,id),
  FOREIGN KEY(tenant_id,author_id) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,file_id) REFERENCES rms.attachment_intent(tenant_id,id)
);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['project_assignment','progress_period','progress_submission'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',t);
    EXECUTE format('GRANT SELECT,INSERT ON rms.%I TO rms_runtime',t);
  END LOOP;
END $$;
GRANT UPDATE(status,submitted_at,content,officer_comment,file_id,revision) ON rms.progress_period TO rms_runtime;
COMMIT;

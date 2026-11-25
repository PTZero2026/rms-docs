BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.acceptance_request (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,attempt integer NOT NULL CHECK(attempt>0),file_id uuid NOT NULL,submitter uuid NOT NULL,
  period_id uuid NOT NULL,summary text NOT NULL,commitments jsonb NOT NULL,submitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,project_id,attempt),FOREIGN KEY(tenant_id,project_id,file_id) REFERENCES rms.attachment_intent(tenant_id,project_id,id),
  FOREIGN KEY(tenant_id,submitter) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,period_id) REFERENCES rms.progress_period(tenant_id,id)
);
ALTER TABLE rms.acceptance_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.acceptance_request FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.acceptance_request TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT ON rms.acceptance_request TO rms_runtime;
ALTER TABLE rms.evaluation_round DROP CONSTRAINT evaluation_round_tenant_id_project_id_kind_key;
CREATE UNIQUE INDEX one_proposal_round ON rms.evaluation_round(tenant_id,project_id) WHERE kind='PROPOSAL_REVIEW';
ALTER TABLE rms.evaluation_round ADD COLUMN acceptance_attempt integer,
  ADD FOREIGN KEY(tenant_id,project_id,acceptance_attempt) REFERENCES rms.acceptance_request(tenant_id,project_id,attempt);
CREATE UNIQUE INDEX one_acceptance_round ON rms.evaluation_round(tenant_id,project_id,acceptance_attempt) WHERE kind='ACCEPTANCE';
COMMIT;

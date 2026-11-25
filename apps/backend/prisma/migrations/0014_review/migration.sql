BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.proposal_document ADD COLUMN finalized_at timestamptz,
  ADD COLUMN finalized_by uuid, ADD FOREIGN KEY(tenant_id,finalized_by) REFERENCES rms.account(tenant_id,id);
CREATE TABLE rms.committee (
  tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),unit_id uuid NOT NULL,
  name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 240),
  kind text NOT NULL CHECK(kind IN ('PROPOSAL_REVIEW','ACCEPTANCE')),
  PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,id,kind),
  FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id)
);
CREATE TABLE rms.committee_seat (
  tenant_id uuid NOT NULL,committee_id uuid NOT NULL,account_id uuid NOT NULL,
  role text NOT NULL CHECK(role IN ('CHAIR','REVIEWER','MEMBER','SECRETARY')),
  PRIMARY KEY(tenant_id,committee_id,account_id),
  FOREIGN KEY(tenant_id,committee_id) REFERENCES rms.committee(tenant_id,id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
CREATE INDEX committee_by_account ON rms.committee_seat(tenant_id,account_id);
CREATE TABLE rms.evaluation_round (
  tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),project_id uuid NOT NULL,
  committee_id uuid NOT NULL,kind text NOT NULL,criteria jsonb NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),concluded_at timestamptz,conclusion text CHECK(conclusion IN ('PASSED','FAILED')),
  decision jsonb,ethics text NOT NULL CHECK(ethics IN ('EXEMPT','PENDING','SUPPLEMENT','APPROVED','REJECTED')),
  ethics_note text,PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,project_id,kind),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,committee_id,kind) REFERENCES rms.committee(tenant_id,id,kind),
  CHECK((concluded_at IS NULL)=(conclusion IS NULL) AND (decision IS NULL)=(conclusion IS NULL))
);
CREATE INDEX rounds_by_committee ON rms.evaluation_round(tenant_id,committee_id);
CREATE TABLE rms.score_sheet (
  tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),round_id uuid NOT NULL,account_id uuid NOT NULL,
  points jsonb NOT NULL,comment text NOT NULL DEFAULT '',total numeric,submitted_at timestamptz,
  PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,round_id,account_id),
  CHECK((total IS NULL)=(submitted_at IS NULL)),
  FOREIGN KEY(tenant_id,round_id) REFERENCES rms.evaluation_round(tenant_id,id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
DO $$
DECLARE owned text;
BEGIN
  FOREACH owned IN ARRAY ARRAY['committee','committee_seat','evaluation_round','score_sheet'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',owned);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',owned);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',owned);
    EXECUTE format('GRANT SELECT,INSERT ON rms.%I TO rms_runtime',owned);
  END LOOP;
END $$;
GRANT UPDATE(ethics,ethics_note,concluded_at,conclusion,decision) ON rms.evaluation_round TO rms_runtime;
GRANT UPDATE(points,comment,total,submitted_at) ON rms.score_sheet TO rms_runtime;
-- A live eligibility projection is shared by queue, sheet mutations and the final count.
CREATE VIEW rms.eligible_reviewer WITH(security_invoker=true) AS
SELECT r.tenant_id,r.id AS round_id,s.account_id,s.role
FROM rms.evaluation_round r
JOIN rms.committee_seat s ON (s.tenant_id,s.committee_id)=(r.tenant_id,r.committee_id)
JOIN rms.account a ON (a.tenant_id,a.id)=(s.tenant_id,s.account_id)
JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
WHERE a.is_active AND a.deleted_at IS NULL AND p.owner_id<>s.account_id
AND NOT EXISTS(SELECT 1 FROM rms.project_member m WHERE (m.tenant_id,m.project_id,m.account_id)=(r.tenant_id,r.project_id,s.account_id));
GRANT SELECT ON rms.eligible_reviewer TO rms_runtime;
COMMIT;

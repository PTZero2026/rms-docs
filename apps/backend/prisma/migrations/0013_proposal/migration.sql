BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.proposal_document (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,field_id uuid,months integer CHECK(months>0),
  budget bigint CHECK(budget>=0 AND budget<=9007199254740991),document jsonb NOT NULL DEFAULT '{}',
  form_snapshot jsonb NOT NULL,return_reason text,PRIMARY KEY(tenant_id,project_id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,field_id) REFERENCES rms.intake_reference(tenant_id,id)
);
CREATE TABLE rms.project_member (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,account_id uuid NOT NULL,principal boolean NOT NULL,
  PRIMARY KEY(tenant_id,project_id,account_id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
CREATE UNIQUE INDEX project_one_pi ON rms.project_member(tenant_id,project_id) WHERE principal;
CREATE INDEX project_member_lookup ON rms.project_member(tenant_id,account_id,project_id);
DO $$
DECLARE owned text;
BEGIN
  FOREACH owned IN ARRAY ARRAY['proposal_document','project_member'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',owned);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',owned);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',owned);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE ON rms.%I TO rms_runtime',owned);
  END LOOP;
END $$;
GRANT DELETE ON rms.project_member TO rms_runtime;
COMMIT;

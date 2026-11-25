BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.report_unit_grant (
  tenant_id uuid NOT NULL,account_id uuid NOT NULL,unit_id uuid NOT NULL,PRIMARY KEY(tenant_id,account_id,unit_id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id)
);
CREATE TABLE rms.call_report_snapshot (
  tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),account_id uuid NOT NULL,
  call_id uuid NOT NULL,call_code text NOT NULL,unit_ids uuid[] NOT NULL,unit_labels text[] NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT statement_timestamp(),entries jsonb NOT NULL CHECK(jsonb_typeof(entries)='array'),
  PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY(tenant_id,call_id) REFERENCES rms.proposal_call(tenant_id,id)
);
DO $$
DECLARE owned text;
BEGIN
  FOREACH owned IN ARRAY ARRAY['report_unit_grant','call_report_snapshot'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',owned);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',owned);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime,rms_migrate USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',owned);
    EXECUTE format('GRANT SELECT ON rms.%I TO rms_runtime',owned);
  END LOOP;
END $$;
GRANT INSERT ON rms.call_report_snapshot TO rms_runtime;
COMMIT;

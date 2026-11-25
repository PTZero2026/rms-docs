BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.applied_project
  ADD COLUMN approval_revision integer,
  ADD COLUMN hour_trigger text NOT NULL DEFAULT 'ON_RESULT_APPROVED' CHECK(hour_trigger IN ('ON_PROJECT_APPROVED','ON_RESULT_APPROVED')),
  ADD COLUMN result_status text NOT NULL DEFAULT 'DRAFT' CHECK(result_status IN ('DRAFT','PENDING','CONFIRMED')),
  ADD COLUMN result_summary text NOT NULL DEFAULT '',
  ADD COLUMN result_date date,
  ADD CHECK(result_status='DRAFT' OR (status='APPROVED' AND result_summary<>'' AND result_date IS NOT NULL));
GRANT UPDATE(approval_revision,hour_trigger,result_status,result_summary,result_date) ON rms.applied_project TO rms_runtime;
ALTER TABLE rms.attachment_intent ADD COLUMN applied_cycle integer CHECK(applied_cycle IS NULL OR (applied_id IS NOT NULL AND applied_cycle>0));
CREATE TABLE rms.applied_member (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,account_id uuid NOT NULL,
  role text NOT NULL CHECK(role IN ('MEMBER','SECRETARY')), share integer NOT NULL CHECK(share BETWEEN 1 AND 99),
  PRIMARY KEY(tenant_id,project_id,account_id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.applied_project(tenant_id,id),
  FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.applied_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.applied_member FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.applied_member TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,DELETE ON rms.applied_member TO rms_runtime;

ALTER TABLE rms.hour_request DROP CONSTRAINT hour_request_tenant_id_source_id_fkey,
  ADD COLUMN extension_id uuid GENERATED ALWAYS AS (CASE WHEN kind IN ('activity','upper-project') THEN source_id END) STORED,
  ADD COLUMN applied_id uuid GENERATED ALWAYS AS (CASE WHEN kind='applied-project' THEN source_id END) STORED,
  ADD CHECK(num_nonnulls(extension_id,applied_id)=1),
  ADD FOREIGN KEY(tenant_id,extension_id) REFERENCES rms.extension_entry(tenant_id,id),
  ADD FOREIGN KEY(tenant_id,applied_id) REFERENCES rms.applied_project(tenant_id,id);

ALTER TABLE rms.hour_formula
  ADD COLUMN min_vnd bigint NOT NULL DEFAULT 0 CHECK(min_vnd>=0),
  ADD COLUMN max_vnd bigint CHECK(max_vnd>min_vnd),
  ADD CHECK(kind='applied-project' OR (min_vnd=0 AND max_vnd IS NULL));
DO $$
DECLARE prior_key name;
BEGIN
  SELECT conname INTO STRICT prior_key FROM pg_constraint WHERE conrelid='rms.hour_formula'::regclass AND contype='u'
    AND pg_get_constraintdef(oid)='UNIQUE (tenant_id, kind, category, role, period_type, version)';
  EXECUTE format('ALTER TABLE rms.hour_formula DROP CONSTRAINT %I',prior_key);
END $$;
ALTER TABLE rms.hour_formula ADD UNIQUE(tenant_id,kind,category,role,period_type,min_vnd,version);
ALTER TABLE rms.hour_request ADD COLUMN amount_vnd bigint CHECK(amount_vnd>=0),
  ADD CHECK((kind='applied-project')=(amount_vnd IS NOT NULL));
CREATE OR REPLACE FUNCTION rms.apply_teaching_hours(calendar jsonb) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE item record; applied integer:=0; rec_id uuid;
BEGIN
 FOR item IN SELECT q.*,f.id AS formula,f.hours AS base,f.version,period->>'code' AS period_code,period->>'type' AS period_type
   FROM rms.hour_request q JOIN rms.hour_formula f ON (f.tenant_id,f.kind,f.category,f.role)=(q.tenant_id,q.kind,q.category,q.role)
   CROSS JOIN LATERAL jsonb_array_elements(calendar) period
   WHERE q.processed_at IS NULL AND q.tenant_id=rms.current_tenant() AND q.source_date BETWEEN f.valid_from AND f.valid_to
   AND (q.kind<>'applied-project' OR (q.amount_vnd>=f.min_vnd AND (f.max_vnd IS NULL OR q.amount_vnd<f.max_vnd)))
   AND f.period_type=period->>'type' AND q.source_date BETWEEN (period->>'from')::date AND (period->>'to')::date
   ORDER BY q.source_date,q.id LIMIT 100 FOR UPDATE OF q SKIP LOCKED
 LOOP
   INSERT INTO rms.hour_record(tenant_id,request_id,formula_id,period_type,period_code,hours) VALUES(item.tenant_id,item.id,item.formula,item.period_type,item.period_code,round(item.base*item.share/100,2))
   ON CONFLICT(tenant_id,request_id) DO NOTHING RETURNING id INTO rec_id;
   IF rec_id IS NOT NULL THEN
     INSERT INTO rms.audit_log(tenant_id,actor_service,target_id,target_type,action,details)
       VALUES(item.tenant_id,'teaching-hour-worker',item.source_id,item.kind,'TEACHING_HOURS_RECORDED',jsonb_build_object('record',rec_id,'request',item.id,'version',item.version,'period',item.period_code,'recipient',item.recipient));
     applied:=applied+1;
   END IF;
   UPDATE rms.hour_request SET processed_at=now() WHERE tenant_id=item.tenant_id AND id=item.id;
 END LOOP;
 RETURN applied;
END $$;
COMMIT;

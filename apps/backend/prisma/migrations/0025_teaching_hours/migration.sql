BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.hour_formula (
 tenant_id uuid REFERENCES rms.tenant(id),id uuid DEFAULT gen_random_uuid(),kind text NOT NULL,category text NOT NULL,role text NOT NULL,
 period_type text NOT NULL CHECK(period_type IN ('ACADEMIC_YEAR','FISCAL_YEAR')),valid_from date NOT NULL,valid_to date NOT NULL,
 hours numeric(12,2) NOT NULL CHECK(hours>=0),version text NOT NULL,PRIMARY KEY(tenant_id,id),CHECK(valid_to>=valid_from),
 UNIQUE(tenant_id,kind,category,role,period_type,version)
);
CREATE TABLE rms.hour_request (
 tenant_id uuid NOT NULL,id uuid DEFAULT gen_random_uuid(),source_id uuid NOT NULL,source_revision integer NOT NULL,unit_id uuid NOT NULL,
 kind text NOT NULL,category text NOT NULL,source_date date NOT NULL,recipient uuid NOT NULL,role text NOT NULL,share integer NOT NULL CHECK(share BETWEEN 1 AND 100),
 processed_at timestamptz,PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,kind,source_id,source_revision,recipient,role),
 FOREIGN KEY(tenant_id,source_id) REFERENCES rms.extension_entry(tenant_id,id),FOREIGN KEY(tenant_id,recipient) REFERENCES rms.account(tenant_id,id)
);
CREATE INDEX pending_hour_requests ON rms.hour_request(tenant_id,source_date,id) WHERE processed_at IS NULL;
CREATE TABLE rms.hour_record (
 tenant_id uuid NOT NULL,id uuid DEFAULT gen_random_uuid(),request_id uuid NOT NULL,formula_id uuid NOT NULL,period_type text NOT NULL,period_code text NOT NULL,
 hours numeric(12,2) NOT NULL CHECK(hours>=0),PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,request_id),
 FOREIGN KEY(tenant_id,formula_id) REFERENCES rms.hour_formula(tenant_id,id),FOREIGN KEY(tenant_id,request_id) REFERENCES rms.hour_request(tenant_id,id)
);
CREATE TABLE rms.hour_adjustment (
 tenant_id uuid NOT NULL,id uuid NOT NULL,record_id uuid NOT NULL,actor_id uuid NOT NULL,delta numeric(12,2) NOT NULL CHECK(delta<>0),reason text NOT NULL CHECK(btrim(reason)<>''),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id,record_id) REFERENCES rms.hour_record(tenant_id,id),FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id)
);
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['hour_formula','hour_request','hour_record','hour_adjustment'] LOOP
  EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY scoped ON rms.%I TO rms_runtime,rms_migrate USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant())',t);
  EXECUTE format('GRANT SELECT ON rms.%I TO rms_runtime',t);
 END LOOP;
END $$;
GRANT INSERT ON rms.hour_request,rms.hour_formula,rms.hour_adjustment TO rms_runtime;
CREATE FUNCTION rms.apply_teaching_hours(calendar jsonb) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE item record; applied integer:=0; rec_id uuid;
BEGIN
 FOR item IN SELECT q.*,f.id AS formula,f.hours AS base,f.version,period->>'code' AS period_code,period->>'type' AS period_type
   FROM rms.hour_request q JOIN rms.hour_formula f ON (f.tenant_id,f.kind,f.category,f.role)=(q.tenant_id,q.kind,q.category,q.role)
   CROSS JOIN LATERAL jsonb_array_elements(calendar) period
   WHERE q.processed_at IS NULL AND q.tenant_id=rms.current_tenant() AND q.source_date BETWEEN f.valid_from AND f.valid_to
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
REVOKE ALL ON FUNCTION rms.apply_teaching_hours(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.apply_teaching_hours(jsonb) TO rms_worker;
COMMIT;

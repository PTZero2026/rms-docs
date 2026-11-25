BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.intake_reference (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),id uuid NOT NULL DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK(kind IN ('field','form','criteria')),name text NOT NULL CHECK(btrim(name)<>''),
  revision integer NOT NULL DEFAULT 1 CHECK(revision>0),active boolean NOT NULL DEFAULT true,
  definition jsonb NOT NULL DEFAULT '{}',PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,kind,name,revision)
);
CREATE TABLE rms.proposal_call (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL CHECK(code ~ '^[A-Za-z0-9._-]{1,64}$'),name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 240),
  start_date date NOT NULL,end_date date NOT NULL CHECK(end_date>=start_date),
  status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','OPEN','CLOSED','CANCELLED')),
  revision integer NOT NULL DEFAULT 1,template_id uuid,criteria_id uuid,source_snapshot jsonb,
  next_number integer NOT NULL DEFAULT 1 CHECK(next_number>0), PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,template_id) REFERENCES rms.intake_reference(tenant_id,id),
  FOREIGN KEY(tenant_id,criteria_id) REFERENCES rms.intake_reference(tenant_id,id)
);
CREATE UNIQUE INDEX proposal_call_code ON rms.proposal_call(lower(code COLLATE "C"));
CREATE INDEX call_window ON rms.proposal_call(tenant_id,status,start_date,end_date);
CREATE TABLE rms.call_field (
  tenant_id uuid NOT NULL,call_id uuid NOT NULL,field_id uuid NOT NULL,PRIMARY KEY(tenant_id,call_id,field_id),
  FOREIGN KEY(tenant_id,call_id) REFERENCES rms.proposal_call(tenant_id,id),
  FOREIGN KEY(tenant_id,field_id) REFERENCES rms.intake_reference(tenant_id,id)
);
CREATE FUNCTION rms.receiving(status text,starts date,ends date,at_time timestamptz) RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT status='OPEN' AND (at_time AT TIME ZONE 'Asia/Ho_Chi_Minh')::date BETWEEN starts AND ends $$;
ALTER TABLE rms.research_project ADD COLUMN call_id uuid,
  ADD COLUMN project_code text UNIQUE, ADD COLUMN submitted_at timestamptz,
  ADD FOREIGN KEY(tenant_id,call_id) REFERENCES rms.proposal_call(tenant_id,id);
CREATE INDEX project_by_call ON rms.research_project(tenant_id,call_id);
DO $$
DECLARE owned text;
BEGIN
  FOREACH owned IN ARRAY ARRAY['intake_reference','proposal_call','call_field'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',owned);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',owned);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime,rms_migrate USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',owned);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE ON rms.%I TO rms_runtime',owned);
  END LOOP;
END $$;
GRANT DELETE ON rms.call_field TO rms_runtime;
COMMIT;

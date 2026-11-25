BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TYPE rms.project_semantic AS ENUM ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','IN_PROGRESS','SUSPENDED',
  'PENDING_ACCEPTANCE','UNDER_ACCEPTANCE','PASSED','FAILED','COMPLETED','REJECTED','CANCELLED');
ALTER TABLE rms.research_project
  ADD COLUMN owner_id uuid,
  ADD FOREIGN KEY (tenant_id,owner_id) REFERENCES rms.account(tenant_id,id),
  ADD COLUMN status text NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN status_semantic rms.project_semantic NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN row_version integer NOT NULL DEFAULT 0 CHECK (row_version>=0);
CREATE TABLE rms.workflow_template (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),
  version integer NOT NULL CHECK(version>0),
  PRIMARY KEY(tenant_id,version)
);
CREATE TABLE rms.workflow_active (
  tenant_id uuid PRIMARY KEY,
  version integer NOT NULL,
  FOREIGN KEY(tenant_id,version) REFERENCES rms.workflow_template(tenant_id,version)
);
CREATE TABLE rms.workflow_step (
  tenant_id uuid NOT NULL, version integer NOT NULL, code text NOT NULL,
  semantic rms.project_semantic NOT NULL, initial boolean NOT NULL, final boolean NOT NULL,
  PRIMARY KEY(tenant_id,version,code),
  FOREIGN KEY(tenant_id,version) REFERENCES rms.workflow_template(tenant_id,version)
);
CREATE UNIQUE INDEX workflow_single_start ON rms.workflow_step(tenant_id,version) WHERE initial;
CREATE TABLE rms.workflow_edge (
  tenant_id uuid NOT NULL, version integer NOT NULL, code text NOT NULL, from_step text NOT NULL, to_step text NOT NULL,
  roles rms.user_type[] NOT NULL, requires_comment boolean NOT NULL, guards text[] NOT NULL, effects text[] NOT NULL,
  PRIMARY KEY(tenant_id,version,code),
  FOREIGN KEY(tenant_id,version,from_step) REFERENCES rms.workflow_step(tenant_id,version,code),
  FOREIGN KEY(tenant_id,version,to_step) REFERENCES rms.workflow_step(tenant_id,version,code)
);
CREATE TABLE rms.workflow_instance (
  tenant_id uuid NOT NULL, project_id uuid NOT NULL, version integer NOT NULL, current_step text NOT NULL,
  PRIMARY KEY(tenant_id,project_id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,version,current_step) REFERENCES rms.workflow_step(tenant_id,version,code)
);
CREATE TABLE rms.workflow_history (
  tenant_id uuid NOT NULL, project_id uuid NOT NULL, revision integer NOT NULL, template_version integer NOT NULL,
  transition text NOT NULL, from_step text NOT NULL, to_step text NOT NULL,
  actor_id uuid NOT NULL, reason text NOT NULL, audit_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,project_id,revision),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.workflow_instance(tenant_id,project_id),
  FOREIGN KEY(tenant_id,template_version,transition) REFERENCES rms.workflow_edge(tenant_id,version,code),
  FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY(tenant_id,audit_id) REFERENCES rms.audit_log(tenant_id,id)
);
CREATE TABLE rms.outbox (
  tenant_id uuid NOT NULL, id uuid NOT NULL, target_id uuid NOT NULL, event_type text NOT NULL,
  effects text[] NOT NULL, audit_id uuid NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,audit_id) REFERENCES rms.audit_log(tenant_id,id)
);
DO $$
DECLARE owned text;
BEGIN
  FOREACH owned IN ARRAY ARRAY['workflow_template','workflow_active','workflow_step','workflow_edge','workflow_instance','workflow_history','outbox']
  LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',owned);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',owned);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant())',owned);
    EXECUTE format('GRANT SELECT,INSERT ON rms.%I TO rms_runtime',owned);
  END LOOP;
END $$;
GRANT UPDATE(version) ON rms.workflow_active TO rms_runtime;
GRANT UPDATE(current_step) ON rms.workflow_instance TO rms_runtime;
COMMIT;

BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.proposal_ai_policy (
 tenant_id uuid NOT NULL,project_id uuid NOT NULL,permitted boolean NOT NULL DEFAULT false,PRIMARY KEY(tenant_id,project_id),
 FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id)
);
CREATE TABLE rms.reading_source (
 tenant_id uuid REFERENCES rms.tenant(id),id uuid NOT NULL,doi text NOT NULL,title text NOT NULL,authors text NOT NULL,year integer NOT NULL,
 version text NOT NULL,verified_url text NOT NULL,ai_metadata boolean NOT NULL DEFAULT false,ai_fulltext boolean NOT NULL DEFAULT false,
 full_until timestamptz,PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,doi)
);
CREATE TABLE rms.reading_access (
 tenant_id uuid NOT NULL,source_id uuid NOT NULL,account_id uuid NOT NULL,read_metadata boolean NOT NULL,read_full boolean NOT NULL,
 PRIMARY KEY(tenant_id,source_id,account_id),FOREIGN KEY(tenant_id,source_id) REFERENCES rms.reading_source(tenant_id,id),
 FOREIGN KEY(tenant_id,account_id) REFERENCES rms.account(tenant_id,id),CHECK(NOT read_full OR read_metadata)
);
CREATE TABLE rms.reading_passage (
 tenant_id uuid NOT NULL,source_id uuid NOT NULL,version text NOT NULL,field text NOT NULL CHECK(field IN ('method','result')),
 position text NOT NULL,label text NOT NULL,excerpt text NOT NULL CHECK(length(excerpt) BETWEEN 1 AND 2000),
 PRIMARY KEY(tenant_id,source_id,version,field,position),FOREIGN KEY(tenant_id,source_id) REFERENCES rms.reading_source(tenant_id,id)
);
CREATE TABLE rms.ai_suggestion (
 tenant_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),actor_id uuid NOT NULL,proposal_id uuid,reading_id uuid,
 source_version text NOT NULL,template_version text NOT NULL,model text NOT NULL,prompt text NOT NULL,
 citations jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,id),CHECK(num_nonnulls(proposal_id,reading_id)=1),
 FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,proposal_id) REFERENCES rms.research_project(tenant_id,id),
 FOREIGN KEY(tenant_id,reading_id) REFERENCES rms.reading_source(tenant_id,id)
);
CREATE INDEX proposal_suggestions ON rms.ai_suggestion(tenant_id,actor_id,proposal_id,created_at DESC);
CREATE INDEX reading_suggestions ON rms.ai_suggestion(tenant_id,actor_id,reading_id,created_at DESC);
CREATE TABLE rms.ai_decision (
 tenant_id uuid NOT NULL,suggestion_id uuid NOT NULL,field text NOT NULL,choice text NOT NULL CHECK(choice IN ('use','discard')),
 PRIMARY KEY(tenant_id,suggestion_id,field),FOREIGN KEY(tenant_id,suggestion_id) REFERENCES rms.ai_suggestion(tenant_id,id)
);
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['proposal_ai_policy','reading_source','reading_access','reading_passage','ai_suggestion','ai_decision'] LOOP
  EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant())',t);
  EXECUTE format('GRANT SELECT ON rms.%I TO rms_runtime',t);
 END LOOP;
END $$;
GRANT INSERT ON rms.ai_suggestion,rms.ai_decision TO rms_runtime;
GRANT UPDATE(choice) ON rms.ai_decision TO rms_runtime;
COMMIT;

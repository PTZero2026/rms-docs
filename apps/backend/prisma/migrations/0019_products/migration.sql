BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.research_output (
  tenant_id uuid NOT NULL,id uuid NOT NULL,project_id uuid,owner_id uuid NOT NULL,unit_id uuid NOT NULL,title text NOT NULL,normalized_title text NOT NULL,
  kind text NOT NULL,publication_year integer,publication text NOT NULL,authors uuid[] NOT NULL DEFAULT '{}',files uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED')),revision integer NOT NULL DEFAULT 1,
  reason text NOT NULL DEFAULT '',reviewed_by uuid,reviewed_at timestamptz,
  PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,owner_id) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),
  FOREIGN KEY(tenant_id,reviewed_by) REFERENCES rms.account(tenant_id,id)
);
CREATE UNIQUE INDEX product_identity ON rms.research_output(tenant_id,project_id,normalized_title,kind,publication_year) WHERE status IN ('PENDING_APPROVAL','APPROVED') AND project_id IS NOT NULL;
CREATE INDEX product_queue ON rms.research_output(tenant_id,unit_id,status);
CREATE INDEX product_by_project ON rms.research_output(tenant_id,project_id,status,kind);
CREATE TABLE rms.product_evidence_revocation (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,file_id uuid NOT NULL,actor_id uuid NOT NULL,reason text NOT NULL,revoked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,project_id,file_id),FOREIGN KEY(tenant_id,project_id,file_id) REFERENCES rms.attachment_intent(tenant_id,project_id,id),
  FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id)
);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['research_output','product_evidence_revocation'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant())',t);
    EXECUTE format('GRANT SELECT,INSERT ON rms.%I TO rms_runtime',t);
  END LOOP;
END $$;
GRANT UPDATE(title,normalized_title,kind,publication_year,publication,authors,files,status,revision,reason,reviewed_by,reviewed_at) ON rms.research_output TO rms_runtime;
CREATE OR REPLACE FUNCTION rms.queue_notification() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF 'notify'=ANY(NEW.effects) THEN
    INSERT INTO rms.delivery(tenant_id,event_id,recipient_id,channel)
    SELECT DISTINCT NEW.tenant_id,NEW.id,recipient::uuid,c FROM
      jsonb_array_elements_text(coalesce(NEW.payload->'recipientIds',jsonb_build_array(NEW.payload->>'ownerId'))) recipient,
      unnest(ARRAY['in_app','smtp']) c;
  END IF;
  RETURN NEW;
END $$;
COMMIT;

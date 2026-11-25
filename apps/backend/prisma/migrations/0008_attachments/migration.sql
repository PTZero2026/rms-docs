BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.attachment_intent (
  tenant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), project_id uuid NOT NULL, resource_version integer NOT NULL,
  uploader_id uuid NOT NULL, filename text NOT NULL, mime text NOT NULL, size_bytes integer NOT NULL CHECK(size_bytes BETWEEN 1 AND 20971520),
  sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'), created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
  attached_at timestamptz, cleaned_at timestamptz, PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,project_id) REFERENCES rms.research_project(tenant_id,id),
  FOREIGN KEY(tenant_id,uploader_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.attachment_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.attachment_intent FORCE ROW LEVEL SECURITY;
CREATE POLICY attachment_scope ON rms.attachment_intent TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(attached_at,cleaned_at) ON rms.attachment_intent TO rms_runtime;
CREATE INDEX attachment_cleanup ON rms.attachment_intent(tenant_id,expires_at) WHERE cleaned_at IS NULL;
COMMIT;

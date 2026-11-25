BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.applied_project ADD COLUMN category text NOT NULL DEFAULT '', ADD COLUMN reason text NOT NULL DEFAULT '';
GRANT UPDATE(category,reason) ON rms.applied_project TO rms_runtime;
ALTER TABLE rms.attachment_intent ADD COLUMN applied_id uuid, ADD FOREIGN KEY(tenant_id,applied_id) REFERENCES rms.applied_project(tenant_id,id);
DO $$
DECLARE current_check name;
BEGIN
  SELECT conname INTO STRICT current_check FROM pg_constraint WHERE conrelid='rms.attachment_intent'::regclass
    AND contype='c' AND position('num_nonnulls' in pg_get_constraintdef(oid))>0;
  EXECUTE format('ALTER TABLE rms.attachment_intent DROP CONSTRAINT %I',current_check);
END $$;
ALTER TABLE rms.attachment_intent ADD CONSTRAINT file_single_source CHECK (
  num_nonnulls(project_id,extension_id,applied_id)=1 AND (project_id IS NOT NULL)=(evidence_type IS NULL));
CREATE INDEX applied_files ON rms.attachment_intent(tenant_id,applied_id) WHERE applied_id IS NOT NULL;
COMMIT;

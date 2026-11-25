BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.applied_project
  ADD COLUMN directory_partners jsonb NOT NULL DEFAULT '[]'
  CHECK (jsonb_typeof(directory_partners)='array');
GRANT UPDATE(directory_partners) ON rms.applied_project TO rms_runtime;
COMMIT;

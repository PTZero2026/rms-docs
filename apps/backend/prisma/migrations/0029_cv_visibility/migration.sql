BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.cv_download ADD COLUMN visibility jsonb;
COMMIT;

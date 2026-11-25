BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.hour_request
 ADD COLUMN revoked_at timestamptz,
 ADD COLUMN revoked_by uuid,
 ADD COLUMN revocation_reason text,
 ADD FOREIGN KEY(tenant_id,revoked_by) REFERENCES rms.account(tenant_id,id),
 ADD CHECK ((revoked_at IS NULL AND revoked_by IS NULL AND revocation_reason IS NULL)
    OR (revoked_at IS NOT NULL AND revoked_by IS NOT NULL AND length(trim(revocation_reason))>0));
GRANT UPDATE(revoked_at,revoked_by,revocation_reason,processed_at) ON rms.hour_request TO rms_runtime;
COMMIT;

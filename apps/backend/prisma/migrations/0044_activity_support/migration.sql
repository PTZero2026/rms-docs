BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.extension_entry
  DROP CONSTRAINT extension_entry_status_check,
  ADD CONSTRAINT extension_entry_status_check CHECK (
    status IN ('DRAFT','PENDING','APPROVED') OR (kind='activity' AND status='REJECTED')
  ),
  ADD COLUMN support_amount bigint CHECK (
    support_amount IS NULL OR
    (kind='activity' AND status='APPROVED' AND support_amount BETWEEN 1 AND 9007199254740991)
  );
GRANT UPDATE(support_amount) ON rms.extension_entry TO rms_runtime;
COMMIT;

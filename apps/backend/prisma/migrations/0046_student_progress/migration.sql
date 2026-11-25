BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.student_project
  ADD COLUMN require_progress boolean NOT NULL DEFAULT false,
  ADD COLUMN progress_note text NOT NULL DEFAULT '',
  ADD COLUMN progress_by uuid,
  ADD COLUMN progress_at timestamptz,
  ADD FOREIGN KEY(tenant_id,progress_by) REFERENCES rms.account(tenant_id,id),
  ADD CHECK ((progress_note='')=(progress_at IS NULL) AND (progress_at IS NULL)=(progress_by IS NULL));
GRANT UPDATE(require_progress,progress_note,progress_by,progress_at) ON rms.student_project TO rms_runtime;
COMMIT;

BEGIN;
SET LOCAL ROLE rms_migrate;
DO $$
DECLARE confirmation_rule name;
BEGIN
  SELECT conname INTO STRICT confirmation_rule FROM pg_constraint
  WHERE conrelid='rms.student_project'::regclass AND contype='c'
    AND pg_get_constraintdef(oid) LIKE '%status = ''DRAFT''::text%'
    AND pg_get_constraintdef(oid) LIKE '%mentor_state = ''ACCEPTED''::text%';
  EXECUTE format('ALTER TABLE rms.student_project DROP CONSTRAINT %I',confirmation_rule);
END $$;
ALTER TABLE rms.student_project
  DROP CONSTRAINT student_project_status_check,
  ADD COLUMN objective text NOT NULL DEFAULT '',
  ADD COLUMN product text NOT NULL DEFAULT '',
  ADD COLUMN resume_status text CHECK(resume_status IN ('APPROVED','IN_PROGRESS')),
  ADD COLUMN group_min integer,
  ADD COLUMN group_max integer,
  ADD CHECK ((group_min IS NULL)=(group_max IS NULL) AND group_min>=1 AND group_max>=group_min AND group_max<=100),
  ADD CHECK ((status='MENTOR_PENDING')=(resume_status IS NOT NULL)),
  ADD CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','IN_PROGRESS','MENTOR_PENDING','FINAL_SUBMITTED','PASSED','FAILED','COMPLETED')),
  ADD CHECK (status IN ('DRAFT','MENTOR_PENDING') OR mentor_state='ACCEPTED');
GRANT UPDATE(objective,product,resume_status,group_min,group_max) ON rms.student_project TO rms_runtime;
COMMIT;

BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.student_project
  DROP CONSTRAINT student_project_status_check,
  DROP CONSTRAINT student_project_mentor_state_check,
  ADD CHECK(status IN ('DRAFT','SUBMITTED','APPROVED','IN_PROGRESS')),
  ADD CHECK(mentor_state IN ('INVITED','ACCEPTED','DECLINED','RETURNED','RECONFIRM_REQUIRED')),
  ADD CHECK(status='DRAFT' OR mentor_state='ACCEPTED'),
  ADD COLUMN mentor_revision_required boolean NOT NULL DEFAULT false,
  ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
  ADD COLUMN on_approval text NOT NULL DEFAULT 'APPROVED' CHECK(on_approval IN ('APPROVED','IN_PROGRESS'));
GRANT UPDATE(revision,on_approval,mentor_revision_required) ON rms.student_project TO rms_runtime;
COMMIT;

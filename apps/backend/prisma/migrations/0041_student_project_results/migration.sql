BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.student_project
  DROP CONSTRAINT student_project_status_check,
  ADD CHECK(status IN ('DRAFT','SUBMITTED','APPROVED','IN_PROGRESS','FINAL_SUBMITTED','PASSED','FAILED','COMPLETED')),
  ADD COLUMN final_evidence jsonb NOT NULL DEFAULT '[{"code":"REPORT","label":"Báo cáo tổng kết"}]' CHECK(jsonb_typeof(final_evidence)='array'),
  ADD COLUMN require_mentor_final boolean NOT NULL DEFAULT true,
  ADD COLUMN hour_category text NOT NULL DEFAULT 'STUDENT_PROJECT',
  ADD COLUMN final_round integer NOT NULL DEFAULT 1 CHECK(final_round>0),
  ADD COLUMN final_summary text NOT NULL DEFAULT '',
  ADD COLUMN mentor_endorsed boolean NOT NULL DEFAULT false,
  ADD COLUMN acceptance_date date,
  ADD COLUMN result_due_date date,
  ADD COLUMN hours_requested boolean NOT NULL DEFAULT false,
  ADD CHECK((status IN ('PASSED','FAILED','COMPLETED'))=(acceptance_date IS NOT NULL)),
  ADD CHECK(NOT hours_requested OR status='COMPLETED');
GRANT UPDATE(final_evidence,require_mentor_final,hour_category,final_round,final_summary,mentor_endorsed,acceptance_date,result_due_date,hours_requested) ON rms.student_project TO rms_runtime;
ALTER TABLE rms.attachment_intent DROP CONSTRAINT file_single_source,
  ADD COLUMN student_id uuid,
  ADD COLUMN student_round integer,
  ADD FOREIGN KEY(tenant_id,student_id) REFERENCES rms.student_project(tenant_id,id),
  ADD CHECK((student_id IS NULL)=(student_round IS NULL) AND student_round>0),
  ADD CONSTRAINT file_single_source CHECK(num_nonnulls(project_id,extension_id,applied_id,meeting_id,student_id)=1
    AND (num_nonnulls(extension_id,applied_id,student_id)=0)=(evidence_type IS NULL));
CREATE INDEX student_result_files ON rms.attachment_intent(tenant_id,student_id,student_round) WHERE student_id IS NOT NULL;
DO $$
DECLARE old_check name;
BEGIN
  SELECT conname INTO STRICT old_check FROM pg_constraint
    WHERE conrelid='rms.hour_request'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%num_nonnulls(extension_id, applied_id)%';
  EXECUTE format('ALTER TABLE rms.hour_request DROP CONSTRAINT %I',old_check);
END $$;
ALTER TABLE rms.hour_request
  ADD COLUMN student_id uuid GENERATED ALWAYS AS (CASE WHEN kind='student-project' THEN source_id END) STORED,
  ADD CHECK(num_nonnulls(extension_id,applied_id,student_id)=1),
  ADD FOREIGN KEY(tenant_id,student_id) REFERENCES rms.student_project(tenant_id,id);
COMMIT;

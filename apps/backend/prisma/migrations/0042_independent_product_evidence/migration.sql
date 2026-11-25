BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.research_output ADD COLUMN declared_by uuid,
  ADD FOREIGN KEY(tenant_id,declared_by) REFERENCES rms.account(tenant_id,id);
ALTER TABLE rms.attachment_intent DROP CONSTRAINT file_single_source,
  ADD COLUMN output_id uuid,
  ADD FOREIGN KEY(tenant_id,output_id) REFERENCES rms.research_output(tenant_id,id),
  ADD CONSTRAINT file_single_source CHECK(num_nonnulls(project_id,extension_id,applied_id,meeting_id,student_id,output_id)=1
    AND (num_nonnulls(extension_id,applied_id,student_id,output_id)=0)=(evidence_type IS NULL)
    AND (output_id IS NULL OR evidence_type='OUTPUT'));
CREATE INDEX independent_output_files ON rms.attachment_intent(tenant_id,output_id) WHERE output_id IS NOT NULL;
COMMIT;

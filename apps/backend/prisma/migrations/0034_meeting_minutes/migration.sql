BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.review_meeting (
 tenant_id uuid NOT NULL,id uuid NOT NULL,round_id uuid NOT NULL,title text NOT NULL,meeting_date date NOT NULL,
 creator_id uuid NOT NULL,revision integer NOT NULL DEFAULT 0,PRIMARY KEY(tenant_id,id),
 FOREIGN KEY(tenant_id,round_id) REFERENCES rms.evaluation_round(tenant_id,id),
 FOREIGN KEY(tenant_id,creator_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.review_meeting ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.review_meeting FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.review_meeting TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(revision) ON rms.review_meeting TO rms_runtime;
CREATE INDEX meeting_round ON rms.review_meeting(tenant_id,round_id,meeting_date,id);
ALTER TABLE rms.attachment_intent DROP CONSTRAINT file_single_source, ADD COLUMN meeting_id uuid,
 ADD FOREIGN KEY(tenant_id,meeting_id) REFERENCES rms.review_meeting(tenant_id,id),
 ADD CONSTRAINT file_single_source CHECK(num_nonnulls(project_id,extension_id,applied_id,meeting_id)=1 AND (num_nonnulls(extension_id,applied_id)=0)=(evidence_type IS NULL));
CREATE UNIQUE INDEX minutes_revision ON rms.attachment_intent(tenant_id,meeting_id,resource_version) WHERE meeting_id IS NOT NULL AND attached_at IS NOT NULL;
COMMIT;

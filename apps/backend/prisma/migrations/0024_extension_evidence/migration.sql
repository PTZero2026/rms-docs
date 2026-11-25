BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.extension_entry (
  tenant_id uuid NOT NULL,id uuid NOT NULL,kind text NOT NULL CHECK(kind IN ('upper-project','activity')),
  unit_id uuid NOT NULL,host_id uuid,owner_id uuid NOT NULL,title text NOT NULL,category text NOT NULL,
  managing_body text NOT NULL,source_date date NOT NULL,status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PENDING','APPROVED')),
  reason text NOT NULL DEFAULT '',revision integer NOT NULL DEFAULT 1, PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),FOREIGN KEY(tenant_id,host_id) REFERENCES rms.unit(tenant_id,id),
  FOREIGN KEY(tenant_id,owner_id) REFERENCES rms.account(tenant_id,id),CHECK(kind<>'upper-project' OR managing_body<>'')
);
CREATE INDEX extension_entries_by_unit ON rms.extension_entry(tenant_id,kind,unit_id,status);
ALTER TABLE rms.extension_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.extension_entry FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.extension_entry TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(host_id,title,category,managing_body,source_date,status,reason,revision) ON rms.extension_entry TO rms_runtime;
ALTER TABLE rms.attachment_intent ALTER COLUMN project_id DROP NOT NULL, ADD COLUMN extension_id uuid, ADD COLUMN evidence_type text,
  ADD FOREIGN KEY(tenant_id,extension_id) REFERENCES rms.extension_entry(tenant_id,id),
  ADD CHECK(num_nonnulls(project_id,extension_id)=1 AND (extension_id IS NULL)=(evidence_type IS NULL));
CREATE INDEX extension_files ON rms.attachment_intent(tenant_id,extension_id) WHERE extension_id IS NOT NULL;
COMMIT;

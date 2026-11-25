BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.cv_template_version (
  tenant_id uuid REFERENCES rms.tenant(id), code text NOT NULL, version text NOT NULL, title text NOT NULL,
  PRIMARY KEY(tenant_id,code,version)
);
CREATE TABLE rms.cv_download (
  tenant_id uuid NOT NULL, id uuid NOT NULL, subject_id uuid NOT NULL, creator_id uuid NOT NULL, audit_id uuid NOT NULL,
  code text NOT NULL, version text NOT NULL, expires_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes',
  pdf bytea NOT NULL CHECK(octet_length(pdf)>0), PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,subject_id) REFERENCES rms.account(tenant_id,id), FOREIGN KEY(tenant_id,creator_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY(tenant_id,audit_id) REFERENCES rms.audit_log(tenant_id,id),
  FOREIGN KEY(tenant_id,code,version) REFERENCES rms.cv_template_version(tenant_id,code,version)
);
CREATE INDEX cv_download_expiry ON rms.cv_download(expires_at);
ALTER TABLE rms.cv_template_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.cv_template_version FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.cv_template_version TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
ALTER TABLE rms.cv_download ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.cv_download FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_scope ON rms.cv_download TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT INSERT,SELECT ON rms.cv_download,rms.cv_template_version TO rms_runtime;
CREATE POLICY expired_downloads ON rms.cv_download FOR DELETE TO rms_worker USING(expires_at<=now());
CREATE POLICY expired_read ON rms.cv_download FOR SELECT TO rms_worker USING(expires_at<=now());
GRANT DELETE ON rms.cv_download TO rms_worker;
GRANT SELECT(expires_at) ON rms.cv_download TO rms_worker;
COMMIT;

BEGIN;
ALTER TABLE catalog.audit ADD COLUMN layout_before text[],
  ADD COLUMN layout_after text[], ADD COLUMN actor_email text;
CREATE POLICY home_layout_history ON catalog.audit FOR SELECT TO rms_config_runtime
  USING (tenant_id=catalog.tenant() AND NOT catalog.shared_writer()
    AND current_setting('rms.home_layout_admin',true)='on'
    AND key IN ('home.user','home.researcher','home.officer','home.admin'));
GRANT SELECT(id,tenant_id,key,actor_id,actor_email,occurred_at,action,layout_before,layout_after)
  ON catalog.audit TO rms_config_runtime;
CREATE INDEX home_layout_history_page ON catalog.audit(tenant_id,key,occurred_at DESC,id DESC)
  WHERE key IN ('home.user','home.researcher','home.officer','home.admin');
COMMIT;

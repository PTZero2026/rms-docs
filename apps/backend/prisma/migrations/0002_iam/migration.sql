BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.tenant ADD COLUMN enabled boolean NOT NULL DEFAULT true;
-- Only onboarding can write trusted issuer metadata. The public lookup exposes
-- one active issuer by slug, never an unscoped account or business record.
CREATE FUNCTION rms.active_realm(requested_slug text)
RETURNS TABLE(id uuid, issuer text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT t.id,t.issuer FROM rms.tenant t WHERE t.slug=requested_slug AND t.enabled
$$;
REVOKE ALL ON FUNCTION rms.active_realm(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.active_realm(text) TO rms_runtime;

ALTER TABLE rms.tenant ADD UNIQUE(id, issuer);
CREATE TYPE rms.user_type AS ENUM ('user','author','staff','admin');
CREATE TABLE rms.account (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  issuer text NOT NULL,
  subject text NOT NULL CHECK (btrim(subject) <> ''),
  email text NOT NULL CHECK (email=lower(btrim(email)) AND email <> ''),
  user_type rms.user_type NOT NULL DEFAULT 'user',
  unit_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  is_profile_complete boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,issuer) REFERENCES rms.tenant(id,issuer),
  UNIQUE (tenant_id,subject), UNIQUE (tenant_id,email),
  FOREIGN KEY (tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),
  CHECK (deleted_at IS NULL OR NOT is_active)
);
ALTER TABLE rms.account ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.account FORCE ROW LEVEL SECURITY;
CREATE POLICY account_isolation ON rms.account TO rms_runtime,rms_migrate
  USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant());
GRANT SELECT, INSERT, UPDATE ON rms.account TO rms_runtime;

CREATE TABLE rms.audit_log (
  tenant_id uuid NOT NULL REFERENCES rms.tenant(id),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_service text,
  CHECK (num_nonnulls(actor_id,actor_service) = 1),
  actor_unit_id uuid,
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  action text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  details jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,actor_id) REFERENCES rms.account(tenant_id,id)
);
CREATE INDEX audit_target ON rms.audit_log(tenant_id,target_type,target_id,occurred_at DESC,id);
ALTER TABLE rms.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_isolation ON rms.audit_log TO rms_runtime,rms_migrate
  USING (tenant_id=rms.current_tenant()) WITH CHECK (tenant_id=rms.current_tenant());
GRANT SELECT,INSERT ON rms.audit_log TO rms_runtime;
COMMIT;

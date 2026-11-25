BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.account_provision_request (
 tenant_id uuid NOT NULL,command_id uuid NOT NULL,email text NOT NULL,full_name text NOT NULL,unit_id uuid NOT NULL,
 user_type rms.user_type NOT NULL,actor_id uuid NOT NULL,target_id uuid,created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,command_id),UNIQUE(tenant_id,email),FOREIGN KEY(tenant_id,unit_id) REFERENCES rms.unit(tenant_id,id),
 FOREIGN KEY(tenant_id,actor_id) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,target_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.account_provision_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.account_provision_request FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.account_provision_request TO rms_runtime USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT,INSERT,UPDATE(target_id) ON rms.account_provision_request TO rms_runtime;
COMMIT;

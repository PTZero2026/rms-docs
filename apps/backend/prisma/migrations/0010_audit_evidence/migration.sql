BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.audit_log
  ADD COLUMN actor_label text,
  ADD COLUMN actor_unit_label text,
  ADD COLUMN service_kind text NOT NULL DEFAULT 'SYSTEM' CHECK (service_kind IN ('SYSTEM','AI_AGENT')),
  ADD COLUMN on_behalf_of uuid,
  ADD FOREIGN KEY (tenant_id,on_behalf_of) REFERENCES rms.account(tenant_id,id),
  ADD CHECK (on_behalf_of IS NULL OR actor_service IS NOT NULL);
CREATE FUNCTION rms.snapshot_audit_actor() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.actor_id IS NOT NULL THEN
    SELECT a.email INTO NEW.actor_label FROM rms.account a
      WHERE (a.tenant_id,a.id)=(NEW.tenant_id,NEW.actor_id);
  ELSE
    NEW.actor_label=NEW.actor_service;
  END IF;
  IF NEW.actor_unit_id IS NOT NULL THEN
    SELECT u.name INTO NEW.actor_unit_label FROM rms.unit u
      WHERE (u.tenant_id,u.id)=(NEW.tenant_id,NEW.actor_unit_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER audit_snapshot BEFORE INSERT ON rms.audit_log
  FOR EACH ROW EXECUTE FUNCTION rms.snapshot_audit_actor();
COMMIT;

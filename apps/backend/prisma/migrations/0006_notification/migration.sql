BEGIN;
SET LOCAL ROLE rms_migrate;
GRANT USAGE ON SCHEMA rms TO rms_worker;
CREATE TABLE rms.delivery (
  tenant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), event_id uuid NOT NULL, recipient_id uuid NOT NULL,
  channel text NOT NULL CHECK(channel IN ('in_app','smtp')), attempts integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','leased','sent','failed','reconcile','skipped')),
  available_at timestamptz NOT NULL DEFAULT now(), lease_id uuid, lease_until timestamptz, last_error text,
  PRIMARY KEY(tenant_id,id), UNIQUE(tenant_id,event_id,recipient_id,channel),
  FOREIGN KEY(tenant_id,event_id) REFERENCES rms.outbox(tenant_id,id),
  FOREIGN KEY(tenant_id,recipient_id) REFERENCES rms.account(tenant_id,id)
);
CREATE INDEX delivery_ready ON rms.delivery(available_at,tenant_id,id) WHERE status='ready';
CREATE INDEX delivery_expiry ON rms.delivery(lease_until,tenant_id,id) WHERE status='leased';
CREATE TABLE rms.notice (
  tenant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), event_id uuid NOT NULL, recipient_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz,
  PRIMARY KEY(tenant_id,id), UNIQUE(tenant_id,event_id,recipient_id),
  FOREIGN KEY(tenant_id,event_id) REFERENCES rms.outbox(tenant_id,id),
  FOREIGN KEY(tenant_id,recipient_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.delivery FORCE ROW LEVEL SECURITY;
CREATE POLICY delivery_scope ON rms.delivery TO rms_runtime,rms_worker USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
CREATE POLICY dispatch_queue ON rms.delivery TO rms_migrate USING(true) WITH CHECK(true);
ALTER TABLE rms.notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.notice FORCE ROW LEVEL SECURITY;
CREATE POLICY notice_scope ON rms.notice TO rms_runtime,rms_worker USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
CREATE POLICY worker_account ON rms.account FOR SELECT TO rms_worker USING(tenant_id=rms.current_tenant());
GRANT SELECT(id,email,is_active,deleted_at,tenant_id) ON rms.account TO rms_worker;
GRANT SELECT,INSERT ON rms.delivery TO rms_runtime;
GRANT SELECT ON rms.notice TO rms_runtime;
GRANT UPDATE(read_at) ON rms.notice TO rms_runtime;
GRANT SELECT,UPDATE(status,lease_until,lease_id,attempts,available_at,last_error) ON rms.delivery TO rms_worker;
GRANT SELECT,INSERT ON rms.notice TO rms_worker;

-- Expose at most one tenant with due work. Payloads are read inside a scoped transaction.
CREATE FUNCTION rms.next_delivery_tenant() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT d.tenant_id FROM rms.delivery d JOIN rms.tenant t ON t.id=d.tenant_id AND t.enabled
  WHERE (d.status='ready' AND d.available_at<=now()) OR (d.status='leased' AND d.lease_until<=now())
  ORDER BY d.available_at,d.id LIMIT 1
$$;
REVOKE ALL ON FUNCTION rms.next_delivery_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.next_delivery_tenant() TO rms_worker;
CREATE FUNCTION rms.queue_notification() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF 'notify'=ANY(NEW.effects) THEN
    INSERT INTO rms.delivery(tenant_id,event_id,recipient_id,channel)
    SELECT NEW.tenant_id,NEW.id,(NEW.payload->>'ownerId')::uuid,c FROM unnest(ARRAY['in_app','smtp']) c;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER queue_notification AFTER INSERT ON rms.outbox FOR EACH ROW EXECUTE FUNCTION rms.queue_notification();
CREATE POLICY migration_read_outbox ON rms.outbox FOR SELECT TO rms_migrate USING(true);
INSERT INTO rms.delivery(tenant_id,event_id,recipient_id,channel)
SELECT o.tenant_id,o.id,(o.payload->>'ownerId')::uuid,c FROM rms.outbox o CROSS JOIN unnest(ARRAY['in_app','smtp']) c
WHERE 'notify'=ANY(o.effects) ON CONFLICT DO NOTHING;
DROP POLICY migration_read_outbox ON rms.outbox;
COMMIT;

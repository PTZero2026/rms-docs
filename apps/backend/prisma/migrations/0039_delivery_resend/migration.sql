BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.delivery ADD COLUMN retry_revision integer NOT NULL DEFAULT 0 CHECK(retry_revision>=0);
CREATE FUNCTION rms.reset_delivery_retry() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  NEW.retry_revision=OLD.retry_revision+1;
  NEW.attempts=0;
  RETURN NEW;
END $$;
CREATE TRIGGER reset_delivery_retry BEFORE UPDATE OF status ON rms.delivery FOR EACH ROW
  WHEN (OLD.status IN ('failed','reconcile') AND NEW.status='ready') EXECUTE FUNCTION rms.reset_delivery_retry();

CREATE POLICY resend_source ON rms.outbox FOR SELECT TO rms_migrate USING(tenant_id=rms.current_tenant());
CREATE POLICY resend_actor_unit ON rms.unit FOR SELECT TO rms_migrate USING(tenant_id=rms.current_tenant());

CREATE FUNCTION rms.delivery_log_for(who uuid)
RETURNS TABLE(id uuid, event text, title text, recipient text, channel text, status text, attempts integer,
  revision integer, error text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog AS $$
  SELECT d.id,o.event_type,coalesce(d.display_title,o.event_type),recipient.email,d.channel,d.status,d.attempts,d.retry_revision,d.last_error,o.created_at
  FROM rms.delivery d
  JOIN rms.account actor ON actor.tenant_id=d.tenant_id AND actor.id=who AND actor.is_active AND actor.deleted_at IS NULL
  JOIN rms.account recipient ON (recipient.tenant_id,recipient.id)=(d.tenant_id,d.recipient_id)
  JOIN rms.outbox o ON (o.tenant_id,o.id)=(d.tenant_id,d.event_id)
  LEFT JOIN rms.research_project p ON (p.tenant_id,p.id)=(o.tenant_id,o.target_id)
  WHERE d.tenant_id=rms.current_tenant() AND (actor.user_type='admin' OR (actor.user_type='staff' AND p.unit_id=actor.unit_id))
$$;

CREATE FUNCTION rms.resend_failed_delivery(who uuid, target uuid, expected_revision integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE previous_attempts integer; previous_error text;
BEGIN
  UPDATE rms.delivery d SET status='ready',last_error=NULL,available_at=now(),
    lease_id=NULL,lease_until=NULL
  FROM rms.delivery_log_for(who) src
  WHERE d.tenant_id=rms.current_tenant() AND src.id=d.id AND d.id=target
    AND d.channel='smtp' AND d.status='failed' AND d.retry_revision=expected_revision
  RETURNING src.attempts,src.error INTO previous_attempts,previous_error;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO rms.audit_log(tenant_id,actor_id,actor_unit_id,target_id,target_type,action,details)
  SELECT a.tenant_id,a.id,a.unit_id,target,'notification-delivery','NOTIFICATION_RESENT',
    jsonb_build_object('attempts',previous_attempts,'error',previous_error,'revision',expected_revision+1)
  FROM rms.account a WHERE a.tenant_id=rms.current_tenant() AND a.id=who;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION rms.delivery_log_for(uuid),rms.resend_failed_delivery(uuid,uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.delivery_log_for(uuid),rms.resend_failed_delivery(uuid,uuid,integer) TO rms_runtime;
COMMIT;

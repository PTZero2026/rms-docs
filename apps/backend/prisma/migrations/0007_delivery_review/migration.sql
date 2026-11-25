BEGIN;
SET LOCAL ROLE rms_migrate;
GRANT USAGE ON SCHEMA rms TO rms_dispatch_ops;
CREATE TABLE rms.delivery_review (
  tenant_id uuid NOT NULL, delivery_id uuid NOT NULL, happened_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reviewer text NOT NULL, disposition text NOT NULL, evidence text NOT NULL,
  FOREIGN KEY(tenant_id,delivery_id) REFERENCES rms.delivery(tenant_id,id)
);
ALTER TABLE rms.delivery_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.delivery_review FORCE ROW LEVEL SECURITY;
CREATE POLICY review_writer ON rms.delivery_review TO rms_migrate USING(true) WITH CHECK(true);
CREATE FUNCTION rms.delivery_failures(school uuid)
RETURNS TABLE(id uuid,event_id uuid,channel text,status text,attempts integer,error_code text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT d.id,d.event_id,d.channel,d.status,d.attempts,d.last_error FROM rms.delivery d
  WHERE d.tenant_id=school AND d.status IN ('failed','reconcile') ORDER BY d.available_at,d.id
$$;
CREATE FUNCTION rms.review_delivery(school uuid,requested_delivery uuid,decision text,review_evidence text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF decision IS NULL OR decision NOT IN ('confirmed-delivered','confirmed-not-delivered') OR
    review_evidence IS NULL OR length(trim(review_evidence)) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Disposition and evidence required'; END IF;
  UPDATE rms.delivery SET status=CASE WHEN decision='confirmed-delivered' THEN 'sent' ELSE 'ready' END,
    available_at=now(),lease_id=NULL,lease_until=NULL,last_error=NULL
    WHERE tenant_id=school AND id=requested_delivery AND status IN ('reconcile','failed');
  IF NOT FOUND THEN RAISE EXCEPTION 'Delivery unavailable for review'; END IF;
  INSERT INTO rms.delivery_review(tenant_id,delivery_id,reviewer,disposition,evidence) VALUES(school,requested_delivery,session_user,decision,review_evidence);
END $$;
REVOKE ALL ON FUNCTION rms.delivery_failures(uuid), rms.review_delivery(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.delivery_failures(uuid), rms.review_delivery(uuid,uuid,text,text) TO rms_dispatch_ops;
COMMIT;

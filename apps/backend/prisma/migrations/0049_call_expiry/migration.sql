BEGIN;
SET LOCAL ROLE rms_migrate;

CREATE INDEX open_call_deadline ON rms.proposal_call(tenant_id,end_date,id) WHERE status='OPEN';

-- A replay may use an earlier instant. Only the database clock can authorize expiry.
CREATE FUNCTION rms.close_expired_calls(as_of timestamptz DEFAULT now()) RETURNS integer
LANGUAGE sql VOLATILE STRICT SECURITY DEFINER SET search_path=pg_catalog AS $$
  WITH due AS (
    SELECT c.tenant_id,c.id FROM rms.proposal_call c JOIN rms.tenant t ON t.id=c.tenant_id
    WHERE c.tenant_id=rms.current_tenant() AND t.enabled AND c.status='OPEN'
      AND c.end_date<(least(as_of,now()) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    ORDER BY c.end_date,c.id LIMIT 200 FOR UPDATE OF c SKIP LOCKED
  ), closed AS (
    UPDATE rms.proposal_call c SET status='CLOSED',revision=c.revision+1
    FROM due WHERE (c.tenant_id,c.id)=(due.tenant_id,due.id)
    RETURNING c.tenant_id,c.id,c.end_date,c.revision
  ), logged AS (
    INSERT INTO rms.audit_log(tenant_id,actor_service,target_id,target_type,action,details)
    SELECT tenant_id,'call-expiry-worker',id,'call','CALL_CLOSED',
      jsonb_build_object('from','OPEN','to','CLOSED','oldEnd',end_date,'end',end_date,'revision',revision,'reason','Hết hạn nhận đề xuất')
    FROM closed RETURNING id
  ) SELECT count(*)::integer FROM logged
$$;
REVOKE ALL ON FUNCTION rms.close_expired_calls(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.close_expired_calls(timestamptz) TO rms_worker;
COMMIT;

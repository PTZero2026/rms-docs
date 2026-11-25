BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE FUNCTION rms.bootstrap_admin(tenant_slug text, verified_subject text) RETURNS uuid
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
DECLARE
  tenant uuid;
  target rms.account%ROWTYPE;
BEGIN
  SELECT id INTO STRICT tenant FROM rms.tenant WHERE slug=tenant_slug AND enabled FOR UPDATE;
  PERFORM set_config('rms.tenant_id', tenant::text, true);
  SELECT * INTO STRICT target FROM rms.account
    WHERE tenant_id=tenant AND subject=verified_subject AND is_active AND deleted_at IS NULL FOR UPDATE;
  IF target.user_type='admin' THEN RETURN target.id; END IF;
  IF EXISTS(SELECT 1 FROM rms.account WHERE tenant_id=tenant AND user_type='admin' AND is_active) THEN
    RAISE EXCEPTION 'Tenant already has an active admin' USING ERRCODE='23514';
  END IF;
  UPDATE rms.account SET user_type='admin' WHERE tenant_id=tenant AND id=target.id;
  INSERT INTO rms.audit_log(tenant_id,actor_service,target_id,target_type,action,details)
  VALUES(tenant,session_user,target.id,'account','ADMIN_BOOTSTRAPPED',jsonb_build_object('before',target.user_type,'after','admin'));
  RETURN target.id;
END;
$$;
REVOKE ALL ON FUNCTION rms.bootstrap_admin(text,text) FROM PUBLIC;
COMMIT;

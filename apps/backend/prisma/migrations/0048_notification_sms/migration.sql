BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.delivery DROP CONSTRAINT delivery_channel_check,
  ADD CONSTRAINT delivery_channel_check CHECK(channel IN ('in_app','smtp','sms'));
ALTER TABLE rms.notice_kind ADD COLUMN default_sms boolean NOT NULL DEFAULT false,
  ADD COLUMN default_sms_body text NOT NULL DEFAULT '{{event}}. Đăng nhập RMS để xem thông báo.';
UPDATE rms.notice_kind SET default_sms=true WHERE code IN ('PROPOSAL_REVIEW_APPROVED','PROJECT_ASSIGNED',
  'PROGRESS_REPORT_OVERDUE','ACCEPTANCE_SCHEDULED','ACCEPTANCE_RESULT');
ALTER TABLE rms.notice_rule ADD COLUMN sms boolean, ADD COLUMN sms_title text, ADD COLUMN sms_body text;
ALTER TABLE rms.notice_preference ADD COLUMN sms boolean NOT NULL DEFAULT true;
GRANT UPDATE(sms,sms_title,sms_body) ON rms.notice_rule TO rms_runtime;
GRANT UPDATE(sms) ON rms.notice_preference TO rms_runtime;

CREATE FUNCTION rms.sms_number(raw text) RETURNS text LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog AS $$
  SELECT CASE WHEN n ~ '^[+][1-9][0-9]{7,14}$' THEN n
    WHEN n ~ '^0[1-9][0-9]{8,9}$' THEN '+84'||substr(n,2) END
  FROM (SELECT regexp_replace(raw,'[(). -]','','g') AS n) normalized
$$;
REVOKE ALL ON FUNCTION rms.sms_number(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.sms_number(text) TO rms_runtime;

CREATE OR REPLACE FUNCTION rms.queue_notification() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE
 canonical text; active_email boolean; required_email boolean; sms_enabled boolean; sms_title text; in_app_title text; email_title text; missing boolean;
BEGIN
 IF NOT ('notify'=ANY(NEW.effects)) THEN RETURN NEW; END IF;
 SELECT coalesce((SELECT code FROM rms.notice_event_alias WHERE event_type=NEW.event_type),NEW.event_type) INTO canonical;
 SELECT coalesce(r.email,true),k.mandatory,coalesce(r.title,k.default_title),coalesce(r.mail_subject,k.default_title),
   k.high_priority AND coalesce(r.sms,k.default_sms),coalesce(r.sms_title,k.default_title)
 INTO active_email,required_email,in_app_title,email_title,sms_enabled,sms_title FROM rms.notice_kind k
 LEFT JOIN rms.notice_rule r ON r.tenant_id=NEW.tenant_id AND r.code=k.code WHERE k.code=canonical;
 missing := NOT FOUND;
 IF missing THEN
   active_email:=true; required_email:=false;
   in_app_title:='Cập nhật hồ sơ nghiên cứu'; email_title:=in_app_title;
 END IF;
 INSERT INTO rms.delivery(tenant_id,event_id,recipient_id,channel,display_title,template_missing)
 SELECT DISTINCT NEW.tenant_id,NEW.id,rec.id::uuid,c,
   CASE WHEN c='smtp' THEN email_title WHEN c='sms' THEN sms_title ELSE in_app_title END,missing
 FROM jsonb_array_elements_text(coalesce(NEW.payload->'recipientIds',jsonb_build_array(NEW.payload->>'ownerId'))) rec(id)
 CROSS JOIN unnest(ARRAY['in_app','smtp','sms']) channel(c)
 LEFT JOIN rms.notice_preference pref ON pref.tenant_id=NEW.tenant_id AND pref.recipient_id=rec.id::uuid AND pref.code=canonical
 LEFT JOIN rms.account a ON a.tenant_id=NEW.tenant_id AND a.id=rec.id::uuid
 WHERE c='in_app' OR (c='smtp' AND active_email AND (required_email OR coalesce(pref.email,true)))
   OR (c='sms' AND sms_enabled AND coalesce(pref.sms,true) AND a.is_active AND a.deleted_at IS NULL
     AND rms.sms_number(a.phone) IS NOT NULL);
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION rms.snapshot_notice_template() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE
  source record; kind record; project_name text; school text; pattern text; date_value text; vars jsonb;
  safe_body constant text := 'Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.';
BEGIN
  SELECT target_id,event_type,payload INTO STRICT source FROM rms.outbox
    WHERE tenant_id=NEW.tenant_id AND id=NEW.event_id;
  SELECT k.code,k.default_title,coalesce(r.body,k.default_body) AS body,
    coalesce(r.mail_body,k.default_mail_body) AS mail_body,coalesce(r.sms_body,k.default_sms_body) AS sms_body INTO kind FROM rms.notice_kind k
    LEFT JOIN rms.notice_rule r ON r.tenant_id=NEW.tenant_id AND r.code=k.code
    WHERE k.code=coalesce((SELECT code FROM rms.notice_event_alias WHERE event_type=source.event_type),source.event_type);
  NEW.safe_title:=coalesce(kind.default_title,'Cập nhật hồ sơ nghiên cứu');
  pattern:=CASE WHEN NEW.channel='smtp' THEN kind.mail_body WHEN NEW.channel='sms' THEN kind.sms_body ELSE kind.body END;
  IF nullif(pattern,'') IS NULL THEN
    NEW.template_missing:=true;
    NEW.rendered_title:=NEW.safe_title; NEW.rendered_body:=safe_body;
    RETURN NEW;
  END IF;
  SELECT p.title,t.slug INTO project_name,school FROM rms.research_project p JOIN rms.tenant t ON t.id=p.tenant_id
    WHERE p.tenant_id=NEW.tenant_id AND p.id=source.target_id;
  date_value:=source.payload->>'dueDate';
  vars:=jsonb_build_object('event',kind.default_title,'projectName',project_name,
    'link','/app/'||school||'?project='||source.target_id,
    'period',source.payload->>'period',
    'dueDate',CASE WHEN date_value ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      THEN substr(date_value,9,2)||'/'||substr(date_value,6,2)||'/'||left(date_value,4) END,
    'result',CASE WHEN kind.code IN ('PROPOSAL_REVIEW_APPROVED','RESEARCH_OUTPUT_APPROVED') THEN 'Đã phê duyệt'
      WHEN kind.code='PROPOSAL_REVIEW_REJECTED' THEN 'Không được duyệt'
      WHEN kind.code='RESEARCH_OUTPUT_REJECTED' THEN 'Cần điều chỉnh'
      WHEN kind.code='ACCEPTANCE_RESULT' AND (source.event_type='PROJECT.PASSED' OR source.payload->>'result'='PASSED') THEN 'Đạt'
      WHEN kind.code='ACCEPTANCE_RESULT' AND (source.event_type='PROJECT.FAILED' OR source.payload->>'result'='FAILED') THEN 'Không đạt' END);
  NEW.title_needs_project:=NEW.display_title ~ '\{\{(projectName|period|dueDate|result|link)\}\}';
  NEW.body_needs_project:=pattern ~ '\{\{(projectName|period|dueDate|result|link)\}\}';
  NEW.rendered_title:=coalesce(rms.render_notice(NEW.display_title,vars),NEW.safe_title);
  NEW.rendered_body:=coalesce(rms.render_notice(pattern,vars),CASE WHEN NEW.channel IN ('smtp','sms') THEN safe_body ELSE NEW.safe_title END);
  RETURN NEW;
END $$;

CREATE FUNCTION rms.sms_destination(target uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT rms.sms_number(a.phone)
  FROM rms.delivery d JOIN rms.outbox o ON (o.tenant_id,o.id)=(d.tenant_id,d.event_id)
  JOIN rms.account a ON (a.tenant_id,a.id)=(d.tenant_id,d.recipient_id)
  JOIN rms.notice_kind k ON k.code=coalesce((SELECT code FROM rms.notice_event_alias WHERE event_type=o.event_type),o.event_type)
  LEFT JOIN rms.notice_rule r ON (r.tenant_id,r.code)=(d.tenant_id,k.code)
  LEFT JOIN rms.notice_preference p ON (p.tenant_id,p.recipient_id,p.code)=(d.tenant_id,d.recipient_id,k.code)
  WHERE d.tenant_id=rms.current_tenant() AND d.id=target AND d.channel='sms' AND d.status='leased'
    AND a.is_active AND a.deleted_at IS NULL AND k.high_priority AND coalesce(r.sms,k.default_sms) AND coalesce(p.sms,true)
$$;
REVOKE ALL ON FUNCTION rms.sms_destination(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.sms_destination(uuid) TO rms_worker;

CREATE OR REPLACE FUNCTION rms.resend_failed_delivery(who uuid, target uuid, expected_revision integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE previous_attempts integer; previous_error text;
BEGIN
  UPDATE rms.delivery d SET status='ready',last_error=NULL,available_at=now(),
    lease_id=NULL,lease_until=NULL
  FROM rms.delivery_log_for(who) src
  WHERE d.tenant_id=rms.current_tenant() AND src.id=d.id AND d.id=target
    AND d.channel IN ('smtp','sms') AND d.status='failed' AND d.retry_revision=expected_revision
  RETURNING src.attempts,src.error INTO previous_attempts,previous_error;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO rms.audit_log(tenant_id,actor_id,actor_unit_id,target_id,target_type,action,details)
  SELECT a.tenant_id,a.id,a.unit_id,target,'notification-delivery','NOTIFICATION_RESENT',
    jsonb_build_object('attempts',previous_attempts,'error',previous_error,'revision',expected_revision+1)
  FROM rms.account a WHERE a.tenant_id=rms.current_tenant() AND a.id=who;
  RETURN true;
END $$;
COMMIT;

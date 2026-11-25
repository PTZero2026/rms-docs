BEGIN;
SET LOCAL ROLE rms_migrate;

INSERT INTO rms.notice_event_alias(event_type,code) VALUES
  ('PROJECT.PASSED','ACCEPTANCE_RESULT'), ('PROJECT.FAILED','ACCEPTANCE_RESULT');

ALTER TABLE rms.notice_kind
  ADD COLUMN default_body text NOT NULL DEFAULT '{{projectName}}',
  ADD COLUMN default_mail_body text NOT NULL DEFAULT 'Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.';
UPDATE rms.notice_kind SET default_body = '{{event}}' WHERE code='PROPOSAL_CALL_OPENED';
UPDATE rms.notice_kind SET default_body = '{{projectName}} · Kỳ {{period}} · Hạn {{dueDate}}'
WHERE code IN ('PROGRESS_REPORT_DUE_SOON','PROGRESS_REPORT_OVERDUE');

-- NULL inherits the catalogue default. An empty body explicitly marks a missing channel template.
ALTER TABLE rms.notice_rule ADD COLUMN body text, ADD COLUMN mail_body text;
GRANT UPDATE(body,mail_body) ON rms.notice_rule TO rms_runtime;
ALTER TABLE rms.delivery ADD COLUMN rendered_title text, ADD COLUMN rendered_body text,
  ADD COLUMN safe_title text, ADD COLUMN title_needs_project boolean NOT NULL DEFAULT false,
  ADD COLUMN body_needs_project boolean NOT NULL DEFAULT false;

CREATE FUNCTION rms.render_notice(pattern text, vars jsonb) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog AS $$
  SELECT CASE WHEN bool_or(m[2] IS NOT NULL AND (vars->>m[2]) IS NULL) THEN NULL
    ELSE string_agg(CASE WHEN m[2] IS NULL THEN m[1] ELSE vars->>m[2] END,'' ORDER BY n) END
  FROM regexp_matches(pattern,'(\{\{([a-zA-Z]+)\}\}|[^{]+|\{)','g') WITH ORDINALITY AS tokens(m,n)
$$;

CREATE FUNCTION rms.snapshot_notice_template() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE
  source record; kind record; project_name text; school text; pattern text; date_value text; vars jsonb;
  safe_body constant text := 'Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.';
BEGIN
  SELECT target_id,event_type,payload INTO STRICT source FROM rms.outbox
    WHERE tenant_id=NEW.tenant_id AND id=NEW.event_id;
  SELECT k.code,k.default_title,coalesce(r.body,k.default_body) AS body,
    coalesce(r.mail_body,k.default_mail_body) AS mail_body INTO kind FROM rms.notice_kind k
    LEFT JOIN rms.notice_rule r ON r.tenant_id=NEW.tenant_id AND r.code=k.code
    WHERE k.code=coalesce((SELECT code FROM rms.notice_event_alias WHERE event_type=source.event_type),source.event_type);
  NEW.safe_title:=coalesce(kind.default_title,'Cập nhật hồ sơ nghiên cứu');
  pattern:=CASE WHEN NEW.channel='smtp' THEN kind.mail_body ELSE kind.body END;
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
  NEW.rendered_body:=coalesce(rms.render_notice(pattern,vars),CASE WHEN NEW.channel='smtp' THEN safe_body ELSE NEW.safe_title END);
  RETURN NEW;
END $$;
CREATE TRIGGER snapshot_notice_template BEFORE INSERT ON rms.delivery FOR EACH ROW
  EXECUTE FUNCTION rms.snapshot_notice_template();

-- The worker may check a queued recipient's copy without general access to project tables.
CREATE POLICY notice_member_read ON rms.project_member FOR SELECT TO rms_migrate USING(tenant_id=rms.current_tenant());
CREATE FUNCTION rms.delivery_copy(delivery_id uuid) RETURNS TABLE(title text,body text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT CASE WHEN d.title_needs_project AND NOT scope.allowed THEN d.safe_title ELSE coalesce(d.rendered_title,d.display_title) END,
    CASE WHEN d.body_needs_project AND NOT scope.allowed THEN 'Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.'
      ELSE d.rendered_body END
  FROM rms.delivery d JOIN rms.outbox o ON (o.tenant_id,o.id)=(d.tenant_id,d.event_id)
  CROSS JOIN LATERAL (SELECT EXISTS(
    SELECT 1 FROM rms.research_project p JOIN rms.account a ON a.tenant_id=p.tenant_id AND a.id=d.recipient_id
    WHERE a.is_active AND a.deleted_at IS NULL AND (p.tenant_id,p.id)=(o.tenant_id,o.target_id)
      AND (a.user_type='admin' OR (a.user_type='staff' AND a.unit_id=p.unit_id) OR (a.user_type='author' AND a.id=p.owner_id)
        OR EXISTS(SELECT 1 FROM rms.project_member m WHERE (m.tenant_id,m.project_id,m.account_id)=(p.tenant_id,p.id,a.id)))
  ) AS allowed) scope
  WHERE d.tenant_id=rms.current_tenant() AND d.id=delivery_id
$$;
REVOKE ALL ON FUNCTION rms.render_notice(text,jsonb),rms.delivery_copy(uuid),rms.snapshot_notice_template() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.render_notice(text,jsonb) TO rms_runtime;
GRANT EXECUTE ON FUNCTION rms.delivery_copy(uuid) TO rms_worker,rms_runtime;
COMMIT;

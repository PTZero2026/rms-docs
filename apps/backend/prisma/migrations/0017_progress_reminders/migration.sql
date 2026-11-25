BEGIN;
SET LOCAL ROLE rms_migrate;

CREATE TABLE rms.progress_reminder (
  tenant_id uuid NOT NULL, project_id uuid NOT NULL, period_id uuid NOT NULL,
  recipient_id uuid NOT NULL, milestone text NOT NULL, event_id uuid NOT NULL,
  PRIMARY KEY (tenant_id,project_id,period_id,recipient_id,milestone),
  FOREIGN KEY (tenant_id,period_id) REFERENCES rms.progress_period(tenant_id,id),
  FOREIGN KEY (tenant_id,recipient_id) REFERENCES rms.account(tenant_id,id),
  FOREIGN KEY (tenant_id,event_id) REFERENCES rms.outbox(tenant_id,id) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE rms.progress_reminder ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.progress_reminder FORCE ROW LEVEL SECURITY;
CREATE POLICY scheduler_scope ON rms.progress_reminder TO rms_migrate USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
CREATE POLICY scheduler_source ON rms.research_project TO rms_migrate USING(tenant_id=rms.current_tenant());
CREATE POLICY scheduler_period ON rms.progress_period TO rms_migrate USING(tenant_id=rms.current_tenant());
CREATE POLICY scheduler_emit ON rms.outbox FOR INSERT TO rms_migrate WITH CHECK(tenant_id=rms.current_tenant());

CREATE FUNCTION rms.reminder_tenants() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT t.id FROM rms.tenant t WHERE t.enabled ORDER BY t.id
$$;
REVOKE ALL ON FUNCTION rms.reminder_tenants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.reminder_tenants() TO rms_worker;

CREATE FUNCTION rms.enqueue_progress_reminders(at_time timestamptz, days_before int) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE
  scoped_tenant uuid := rms.current_tenant();
  today date := (at_time AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  item record; recipient uuid; event uuid; audit uuid; inserted int := 0;
BEGIN
  IF days_before IS NULL OR days_before NOT BETWEEN 0 AND 365 OR today IS NULL THEN
    RAISE EXCEPTION 'Invalid reminder window' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM rms.tenant WHERE id=scoped_tenant AND enabled FOR SHARE;
  IF NOT FOUND THEN RETURN 0; END IF;
  -- Use the same project/period lock order as F04 before issuing a notice.
  FOR item IN
    SELECT p.id AS project_id,p.unit_id,p.owner_id,r.id AS period_id,r.period,r.due_date,
           CASE WHEN r.due_date<today THEN 'overdue' ELSE 'due-'||days_before END AS milestone
    FROM rms.research_project p JOIN rms.progress_period r ON (r.tenant_id,r.project_id)=(p.tenant_id,p.id)
    WHERE p.tenant_id=scoped_tenant AND p.status_semantic='IN_PROGRESS'
      AND r.status IN ('PENDING_SUBMISSION','REVISION_REQUESTED') AND (r.due_date=today+days_before OR r.due_date<today)
    ORDER BY p.id,r.id FOR SHARE OF p,r
  LOOP
    FOR recipient IN
      SELECT a.id FROM rms.account a WHERE a.tenant_id=scoped_tenant AND a.is_active AND a.deleted_at IS NULL AND
        (a.id=item.owner_id OR (item.milestone='overdue' AND a.user_type='staff' AND a.unit_id=item.unit_id AND
          EXISTS(SELECT 1 FROM rms.audit_log l WHERE l.tenant_id=scoped_tenant AND l.target_type='project' AND l.target_id=item.project_id
                 AND l.action='ASSIGNMENT_EFFECTIVE' AND l.actor_id=a.id))) ORDER BY a.id
    LOOP
      event:=gen_random_uuid();
      INSERT INTO rms.progress_reminder VALUES(scoped_tenant,item.project_id,item.period_id,recipient,item.milestone,event)
        ON CONFLICT DO NOTHING;
      IF NOT FOUND THEN CONTINUE; END IF;
      audit:=gen_random_uuid();
      INSERT INTO rms.audit_log(tenant_id,id,actor_service,target_id,target_type,action,details)
        VALUES(scoped_tenant,audit,'deadline-reminder',item.project_id,'project','PROGRESS_REMINDER_QUEUED',
          jsonb_build_object('periodId',item.period_id,'recipientId',recipient,'milestone',item.milestone));
      INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload)
        VALUES(scoped_tenant,event,item.project_id,CASE WHEN item.milestone='overdue' THEN 'PROGRESS_REPORT_OVERDUE' ELSE 'PROGRESS_REPORT_DUE_SOON' END,
          ARRAY['notify'],audit,jsonb_build_object('ownerId',recipient,'periodId',item.period_id,'period',item.period,'dueDate',item.due_date,'milestone',item.milestone));
      inserted:=inserted+1;
    END LOOP;
  END LOOP;
  RETURN inserted;
END $$;
REVOKE ALL ON FUNCTION rms.enqueue_progress_reminders(timestamptz,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rms.enqueue_progress_reminders(timestamptz,int) TO rms_worker;
CREATE INDEX notice_recipient_date ON rms.notice(tenant_id,recipient_id,created_at DESC,id DESC);
COMMIT;

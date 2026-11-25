BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.notice_kind (
  code text PRIMARY KEY,
  default_title text NOT NULL,
  mandatory boolean NOT NULL,
  high_priority boolean NOT NULL
);
INSERT INTO rms.notice_kind VALUES
 ('PROPOSAL_CALL_OPENED','Kỳ nhận đề xuất đã mở',false,false),
 ('PROPOSAL_RECEIVED','Đã nộp đề xuất',false,false),
 ('PROPOSAL_RETURNED_FOR_REVISION','Đề xuất cần bổ sung',false,true),
 ('PROPOSAL_REVIEW_APPROVED','Đề tài đã được phê duyệt',true,true),
 ('PROPOSAL_REVIEW_REJECTED','Kết quả xét duyệt đề xuất',false,true),
 ('PROJECT_ASSIGNED','Đề tài đã được giao thực hiện',false,true),
 ('PROGRESS_REPORT_DUE_SOON','Sắp đến hạn báo cáo tiến độ',false,false),
 ('PROGRESS_REPORT_OVERDUE','Báo cáo tiến độ đã quá hạn',true,true),
 ('BUDGET_ALLOCATION_DISBURSED','Đã xác nhận kinh phí đề tài',false,false),
 ('BUDGET_RECONCILIATION_MISMATCHED','Có chênh lệch kinh phí',false,true),
 ('ACCEPTANCE_SCHEDULED','Đã lập lịch nghiệm thu',false,true),
 ('ACCEPTANCE_RESULT','Đã có kết quả nghiệm thu',true,true),
 ('RESEARCH_OUTPUT_APPROVED','Sản phẩm khoa học đã duyệt',false,false),
 ('RESEARCH_OUTPUT_REJECTED','Sản phẩm khoa học cần điều chỉnh',false,false),
 ('RESEARCH_OUTPUT_SUBMITTED','Đã nộp sản phẩm khoa học',false,false),
 ('ACCEPTANCE_REQUESTED','Đã gửi yêu cầu nghiệm thu',false,false),
 ('BUDGET_ADJUSTED','Đã điều chỉnh kinh phí đề tài',false,false),
 ('PROJECT.UNDER_REVIEW','Đề tài đang xét duyệt',false,false),
 ('PROJECT.SUSPENDED','Đề tài đã tạm dừng',false,false),
 ('PROJECT.COMPLETED','Đề tài đã hoàn thành',false,false);
CREATE TABLE rms.notice_event_alias(event_type text PRIMARY KEY, code text NOT NULL REFERENCES rms.notice_kind);
INSERT INTO rms.notice_event_alias VALUES
 ('CALL_OPENED','PROPOSAL_CALL_OPENED'),('PROJECT.SUBMITTED','PROPOSAL_RECEIVED'),
 ('PROJECT.DRAFT','PROPOSAL_RETURNED_FOR_REVISION'),('PROJECT.APPROVED','PROPOSAL_REVIEW_APPROVED'),
 ('PROJECT.REJECTED','PROPOSAL_REVIEW_REJECTED'),('PROJECT.IN_PROGRESS','PROJECT_ASSIGNED'),
 ('BUDGET_ALLOCATED','BUDGET_ALLOCATION_DISBURSED');
CREATE TABLE rms.notice_rule (
 tenant_id uuid NOT NULL REFERENCES rms.tenant, code text NOT NULL REFERENCES rms.notice_kind,
 email boolean NOT NULL, title text NOT NULL, mail_subject text NOT NULL, revision integer NOT NULL DEFAULT 1,
 PRIMARY KEY(tenant_id,code)
);
CREATE TABLE rms.notice_preference (
 tenant_id uuid NOT NULL, recipient_id uuid NOT NULL, code text REFERENCES rms.notice_kind,
 email boolean NOT NULL, PRIMARY KEY(tenant_id,recipient_id,code),
 FOREIGN KEY(tenant_id,recipient_id) REFERENCES rms.account(tenant_id,id)
);
ALTER TABLE rms.notice_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.notice_rule FORCE ROW LEVEL SECURITY;
ALTER TABLE rms.notice_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms.notice_preference FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped ON rms.notice_rule TO rms_runtime,rms_migrate USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
CREATE POLICY scoped ON rms.notice_preference TO rms_runtime,rms_migrate USING(tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant());
GRANT SELECT ON rms.notice_kind,rms.notice_event_alias TO rms_runtime;
GRANT SELECT,INSERT,UPDATE(email,title,mail_subject,revision) ON rms.notice_rule TO rms_runtime;
GRANT SELECT,INSERT,UPDATE(email) ON rms.notice_preference TO rms_runtime;

ALTER TABLE rms.delivery ADD COLUMN display_title text, ADD COLUMN template_missing boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION rms.queue_notification() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE
 canonical text; active_email boolean; required_email boolean; in_app_title text; email_title text; missing boolean;
BEGIN
 IF NOT ('notify'=ANY(NEW.effects)) THEN RETURN NEW; END IF;
 SELECT coalesce((SELECT code FROM rms.notice_event_alias WHERE event_type=NEW.event_type),NEW.event_type) INTO canonical;
 SELECT coalesce(r.email,true),k.mandatory,coalesce(r.title,k.default_title),coalesce(r.mail_subject,k.default_title)
 INTO active_email,required_email,in_app_title,email_title FROM rms.notice_kind k
 LEFT JOIN rms.notice_rule r ON r.tenant_id=NEW.tenant_id AND r.code=k.code WHERE k.code=canonical;
 missing := NOT FOUND;
 IF missing THEN
   active_email:=true; required_email:=false;
   in_app_title:='Cập nhật hồ sơ nghiên cứu'; email_title:=in_app_title;
 END IF;
 INSERT INTO rms.delivery(tenant_id,event_id,recipient_id,channel,display_title,template_missing)
 SELECT DISTINCT NEW.tenant_id,NEW.id,rec.id::uuid,c,
   CASE WHEN c='smtp' THEN email_title ELSE in_app_title END,missing
 FROM jsonb_array_elements_text(coalesce(NEW.payload->'recipientIds',jsonb_build_array(NEW.payload->>'ownerId'))) rec(id)
 CROSS JOIN unnest(ARRAY['in_app','smtp']) channel(c)
 LEFT JOIN rms.notice_preference pref ON pref.tenant_id=NEW.tenant_id AND pref.recipient_id=rec.id::uuid AND pref.code=canonical
 WHERE c='in_app' OR (active_email AND (required_email OR coalesce(pref.email,true)));
 RETURN NEW;
END $$;
COMMIT;

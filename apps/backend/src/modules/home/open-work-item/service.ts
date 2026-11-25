import { BadRequestException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../../iam/account.js"
import { offset } from "../../proposal/access.js"

type Work=operations["resolveHomeWork"]["responses"][200]["content"]["application/json"]
type Page=operations["listHomeWork"]["responses"][200]["content"]["application/json"]
const source=`SELECT t.*,coalesce(t."dueDate"<($3::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text,false) AS overdue FROM (
  SELECT p.id,p.id AS "targetId",p.title,p.project_code AS "projectCode",'F01' AS feature,c.end_date::text AS "dueDate",'project' AS "targetType"
  FROM rms.research_project p JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
  JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id)
  WHERE $1='author' AND p.owner_id=$2 AND p.status_semantic='DRAFT' AND d.return_reason IS NOT NULL
  UNION ALL
  SELECT r.id,p.id,p.title||' · Báo cáo kỳ '||r.period,p.project_code,'F04',r.due_date::text,'project'
  FROM rms.research_project p JOIN rms.progress_period r ON (r.tenant_id,r.project_id)=(p.tenant_id,p.id)
  WHERE $1='author' AND p.owner_id=$2 AND p.status_semantic='IN_PROGRESS' AND r.status IN ('PENDING_SUBMISSION','REVISION_REQUESTED')
  UNION ALL
  SELECT r.id,r.id,(CASE r.kind WHEN 'ACCEPTANCE' THEN 'Chấm nghiệm thu · ' ELSE 'Chấm phiếu · ' END)||p.title,
    p.project_code,CASE r.kind WHEN 'ACCEPTANCE' THEN 'F06' ELSE 'F03' END,NULL::text,'round'
  FROM rms.eligible_reviewer e JOIN rms.evaluation_round r ON (r.tenant_id,r.id)=(e.tenant_id,e.round_id)
  JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
  WHERE e.account_id=$2 AND r.concluded_at IS NULL AND (
    (r.kind='PROPOSAL_REVIEW' AND p.status_semantic='UNDER_REVIEW' AND EXISTS
      (SELECT 1 FROM rms.proposal_document d WHERE (d.tenant_id,d.project_id)=(p.tenant_id,p.id))) OR
    (r.kind='ACCEPTANCE' AND p.status_semantic='UNDER_ACCEPTANCE' AND EXISTS
      (SELECT 1 FROM rms.acceptance_request q WHERE (q.tenant_id,q.project_id,q.attempt)=(r.tenant_id,r.project_id,r.acceptance_attempt))))
    AND NOT EXISTS(SELECT 1 FROM rms.score_sheet s WHERE (s.tenant_id,s.round_id,s.account_id)=(e.tenant_id,e.round_id,e.account_id) AND s.submitted_at IS NOT NULL)
  UNION ALL
  SELECT p.id,p.id,'Tiếp nhận · '||p.title,p.project_code,'F01',NULL::text,'project'
  FROM rms.research_project p JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
  WHERE $1='staff' AND p.unit_id=$4 AND p.status_semantic='SUBMITTED' AND d.finalized_at IS NULL
  UNION ALL
  SELECT r.id,p.id,'Duyệt báo cáo kỳ '||r.period||' · '||p.title,p.project_code,'F04',NULL::text,'project'
  FROM rms.research_project p JOIN rms.progress_period r ON (r.tenant_id,r.project_id)=(p.tenant_id,p.id)
  WHERE $1='staff' AND p.unit_id=$4 AND p.owner_id<>$2 AND p.status_semantic='IN_PROGRESS' AND r.status='SUBMITTED'
  UNION ALL
  SELECT p.id,p.id,'Điều phối nghiệm thu · '||p.title,p.project_code,'F06',NULL::text,'project'
  FROM rms.research_project p
  WHERE $1='staff' AND p.unit_id=$4 AND p.owner_id<>$2 AND p.status_semantic IN ('PENDING_ACCEPTANCE','UNDER_ACCEPTANCE')
    AND EXISTS (SELECT 1 FROM rms.acceptance_request q WHERE (q.tenant_id,q.project_id)=(p.tenant_id,p.id))
) t`
export async function returnedWork(db:PoolClient,actor:SessionAccount,q:Record<string,unknown>,now=new Date()):Promise<Page>{
  const group=q.group??"all"
  if(group!=="all"&&group!=="overdue")throw new BadRequestException()
  const {rows:[page]}=await db.query<Page>(`WITH allowed AS MATERIALIZED (${source}),
    page AS (SELECT * FROM allowed WHERE $5 OR overdue ORDER BY "dueDate" NULLS LAST,id LIMIT 20 OFFSET $6)
    SELECT true AS visible,count(*)::int AS total,count(*) FILTER(WHERE overdue)::int AS overdue,
      COALESCE((SELECT jsonb_agg(to_jsonb(page) ORDER BY "dueDate" NULLS LAST,id) FROM page),'[]'::jsonb) AS items FROM allowed`,
    [actor.userType,actor.id,now,actor.unitId,group==="all",offset(q.skip)])
  return page
}
export async function openWork(db:PoolClient,actor:SessionAccount,id:string,now=new Date()):Promise<Work>{
  const {rows:[item]}=await db.query<Work>("SELECT * FROM ("+source+") w WHERE w.id=$5",[actor.userType,actor.id,now,actor.unitId,id])
  if(!item)throw new NotFoundException("Công việc không còn trong danh sách của bạn.")
  return item
}

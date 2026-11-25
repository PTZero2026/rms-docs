import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { appendAudit } from "../../audit/append.js"
import type { SessionAccount } from "../../iam/account.js"
import { moveTo } from "../../workflow/move-to.js"

export type RoundKind="PROPOSAL_REVIEW"|"ACCEPTANCE"
type Body<K extends "createReviewCommittee"|"openReview">=operations[K]["requestBody"]["content"]["application/json"]
type Round=operations["getManagedRound"]["responses"][200]["content"]["application/json"]
type Setup=operations["getReviewSetup"]["responses"][200]["content"]["application/json"]
type Assignment=operations["listReviewAssignments"]["responses"][200]["content"]["application/json"][number]
type Criterion=Round["criteria"][number]
export function staffUnit(actor:SessionAccount) {
  if(actor.userType!=="staff" || !actor.unitId)throw new ForbiddenException("Chỉ chuyên viên phụ trách được thực hiện.")
  return actor.unitId
}
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
export async function createCommittee(db:PoolClient,actor:SessionAccount,input:Body<"createReviewCommittee">,kind:RoundKind="PROPOSAL_REVIEW") {
  const unit=staffUnit(actor)
  if(typeof input?.name!=="string" || !input.name.trim() || input.name.length>240 || !Array.isArray(input.seats) ||
    !input.seats.length || input.seats.length>100 || input.seats.some(s=>!s || !uuid.test(s.accountId) || !["CHAIR","REVIEWER","MEMBER","SECRETARY"].includes(s.role)))
    throw new BadRequestException("Cần tên hội đồng và thành viên có chức danh hợp lệ.")
  const ids=input.seats.map(s=>s.accountId)
  const active=await db.query("SELECT id FROM rms.account WHERE is_active AND deleted_at IS NULL AND id=ANY($1::uuid[]) ORDER BY id FOR SHARE",[ids])
  if(active.rowCount!==ids.length)throw new BadRequestException("Thành viên trùng hoặc không còn hiệu lực tại trường.")
  const {rows:[committee]}=await db.query<Setup["committees"][number]>("INSERT INTO rms.committee(tenant_id,unit_id,name,kind) VALUES(rms.current_tenant(),$1,$2,$3) RETURNING id,name AS label",[unit,input.name.trim(),kind])
  await db.query(`INSERT INTO rms.committee_seat SELECT rms.current_tenant(),$1,s.id,s.role
    FROM unnest($2::uuid[],$3::text[]) AS s(id,role)`,[committee.id,ids,input.seats.map(s=>s.role)])
  await appendAudit(db,actor,"committee",committee.id,"COMMITTEE_CREATED",{seats:input.seats})
  return committee
}
export async function reviewSetup(db:PoolClient,actor:SessionAccount):Promise<Setup> {
  const unit=staffUnit(actor)
  const projects=await db.query(`SELECT p.id,p.title AS label,(d.finalized_at IS NOT NULL) AS finalized FROM rms.research_project p
    JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id)
    WHERE p.unit_id=$1 AND c.status='CLOSED' AND p.status_semantic='SUBMITTED' ORDER BY p.title,p.id`,[unit])
  const committees=await db.query("SELECT id,name AS label FROM rms.committee WHERE unit_id=$1 AND kind='PROPOSAL_REVIEW' ORDER BY name,id",[unit])
  const accounts=await db.query("SELECT id,email AS label FROM rms.account WHERE is_active AND deleted_at IS NULL AND unit_id=$1 ORDER BY email",[unit])
  const rounds=await db.query(`SELECT r.id,p.title AS label FROM rms.evaluation_round r JOIN rms.research_project p
    ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id) WHERE p.unit_id=$1 AND r.kind='PROPOSAL_REVIEW' ORDER BY r.opened_at DESC`,[unit])
  return {projects:projects.rows,committees:committees.rows,accounts:accounts.rows,rounds:rounds.rows}
}
export function rubric(def:{type?:string;items?:Criterion[]}|null,kind:RoundKind="PROPOSAL_REVIEW"):Criterion[] {
  const items=def?.items
  if(def?.type!==kind || !Array.isArray(items) || !items.length || items.length>100 ||
    items.some(c=>!c||typeof c.key!=="string"||!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(c.key)||typeof c.label!=="string"||!c.label.trim()||
      !Number.isFinite(c.maxScore)||c.maxScore<=0||c.maxScore>1000 || !Number.isFinite(c.weight)||c.weight<=0||c.weight>1) ||
    new Set(items.map(c=>c.key)).size!==items.length || Math.abs(items.reduce((n,c)=>n+c.weight,0)-1)>0.000001)
    throw new ConflictException("Bộ tiêu chí xét duyệt cần điểm tối đa và tổng trọng số bằng 1.")
  return items
}
export async function managedRound(db:PoolClient,actor:SessionAccount,id:string,write=false,kind:RoundKind="PROPOSAL_REVIEW"):Promise<Round>{
  const unit=staffUnit(actor)
  const {rows:[row]}=await db.query(`SELECT r.id,r.decision_revision AS "decisionRevision",p.id AS "projectId",p.title,r.criteria->'definition'->'items' AS criteria,
    CASE WHEN r.concluded_at IS NULL THEN 'COLLECTING_SCORES' ELSE 'CONCLUDED' END AS status,r.conclusion,
    COALESCE((r.decision->>'count')::integer,(SELECT count(*)::int FROM rms.score_sheet s JOIN rms.eligible_reviewer e
      ON (e.tenant_id,e.round_id,e.account_id)=(s.tenant_id,s.round_id,s.account_id) WHERE s.round_id=r.id AND s.submitted_at IS NOT NULL)) AS count,
    (r.decision->>'mean')::float8 AS mean,(r.decision->>'minimum')::integer AS minimum,(r.decision->>'passing')::float8 AS passing,
    p.status_semantic AS "projectStatus",r.ethics,r.ethics_note AS "ethicsNote"
    FROM rms.evaluation_round r JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    WHERE r.id=$1 AND p.unit_id=$2 AND r.kind=$3 ${write?"FOR UPDATE OF p,r":""}`,[id,unit,kind])
  if(!row)throw new NotFoundException()
  const members=await db.query("SELECT a.id,a.email AS label FROM rms.eligible_reviewer e JOIN rms.account a ON (a.tenant_id,a.id)=(e.tenant_id,e.account_id) WHERE e.round_id=$1 ORDER BY a.email",[id])
  return {...row,eligible:members.rows} as Round
}
export async function openRound(db:PoolClient,actor:SessionAccount,project:string,input:Body<"openReview">) {
  const unit=staffUnit(actor)
  if(!uuid.test(input?.committeeId??"") || typeof input?.ethicsRequired!=="boolean")throw new BadRequestException()
  const {rows:[source]}=await db.query(`SELECT p.row_version,p.status_semantic,c.status,c.source_snapshot->'criteria' AS rubric,d.finalized_at
    FROM rms.research_project p JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id)
    JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    WHERE p.id=$1 AND p.unit_id=$2 FOR UPDATE OF p FOR SHARE OF c`,[project,unit])
  if(!source)throw new NotFoundException()
  const {rows:[prior]}=await db.query("SELECT id,conclusion FROM rms.evaluation_round WHERE project_id=$1 AND kind='PROPOSAL_REVIEW'",[project])
  if(prior && !prior.conclusion && source.status_semantic==="UNDER_REVIEW")return managedRound(db,actor,prior.id)
  if(!source.finalized_at||source.status!=="CLOSED"||source.status_semantic!=="SUBMITTED")throw new ConflictException("Cần chốt hồ sơ đã nộp và đóng kỳ trước khi mở đợt.")
  rubric(source.rubric?.definition)
  const committee=await db.query("SELECT id FROM rms.committee WHERE id=$1 AND unit_id=$2 AND kind='PROPOSAL_REVIEW'",[input.committeeId,unit])
  if(!committee.rowCount)throw new NotFoundException("Hội đồng ngoài phạm vi xét duyệt.")
  const {rows:[r]}=await db.query(`INSERT INTO rms.evaluation_round(tenant_id,project_id,committee_id,kind,criteria,ethics)
    VALUES(rms.current_tenant(),$1,$2,'PROPOSAL_REVIEW',$3,$4) RETURNING id`,[project,input.committeeId,source.rubric,input.ethicsRequired?"PENDING":"EXEMPT"])
  if(!(await db.query("SELECT 1 FROM rms.eligible_reviewer WHERE round_id=$1 LIMIT 1",[r.id])).rowCount)
    throw new ConflictException("Cần ít nhất một người đủ điều kiện chấm.")
  await moveTo(db,actor,project,"UNDER_REVIEW",source.row_version)
  await appendAudit(db,actor,"project",project,"REVIEW_OPENED",{roundId:r.id,committeeId:input.committeeId,criteriaId:source.rubric.id,criteriaVersion:source.rubric.revision})
  return managedRound(db,actor,r.id)
}
export async function reviewQueue(db:PoolClient,actor:SessionAccount):Promise<Assignment[]>{
  const {rows}=await db.query(`SELECT r.id,p.title,r.criteria->'definition'->'items' AS criteria,d.document,
    CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('id',s.id,'points',s.points,'comment',s.comment,'total',s.total,'submitted',s.submitted_at IS NOT NULL) END AS sheet
    FROM rms.eligible_reviewer e JOIN rms.evaluation_round r ON (r.tenant_id,r.id)=(e.tenant_id,e.round_id)
    JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    LEFT JOIN rms.score_sheet s ON (s.tenant_id,s.round_id,s.account_id)=(e.tenant_id,e.round_id,e.account_id)
    WHERE e.account_id=$1 AND r.concluded_at IS NULL AND r.kind='PROPOSAL_REVIEW' ORDER BY r.opened_at,r.id`,[actor.id])
  return rows
}

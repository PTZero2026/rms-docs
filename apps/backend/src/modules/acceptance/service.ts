import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../iam/account.js"
import { appendAudit } from "../audit/append.js"
import { projectAccess } from "../proposal/access.js"
import { productCommitments } from "../product/service.js"
import { moveTo } from "../workflow/move-to.js"
import { createPeriod } from "../progress/service.js"
import { notifyRecipients,unitOfficers } from "../notification/emit.js"
import { managedRound,rubric,staffUnit } from "../review/open-review/service.js"
import { conclude,type ReviewPolicy } from "../review/review-decision/service.js"

type Detail=operations["getAcceptance"]["responses"][200]["content"]["application/json"]
type Body<K extends "openAcceptance"|"requestAcceptance"|"redoAcceptance">=operations[K]["requestBody"]["content"]["application/json"]
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
async function finalPeriod(db:PoolClient,id:string){
  const {rows:[r]}=await db.query("SELECT id,period,status FROM rms.progress_period WHERE project_id=$1 ORDER BY period DESC LIMIT 1",[id])
  return r??null
}
async function officerSource(db:PoolClient,a:SessionAccount,id:string){
  const unit=staffUnit(a),p=await projectAccess(db,a,id,true)
  if(p.unit_id!==unit||p.owner_id===a.id)throw new ForbiddenException()
  return p
}
export async function acceptanceDetail(db:PoolClient,a:SessionAccount,id:string):Promise<Detail>{
  const p=await projectAccess(db,a,id)
  const officer=a.userType==="staff"&&p.unit_id===a.unitId&&p.owner_id!==a.id
  const options=(sql:string,args:unknown[]=[])=>db.query<{id:string;label:string}>(sql,args).then(r=>r.rows)
  const {rows:[request]}=await db.query(`SELECT q.attempt,q.summary,r.decision_revision,r.id AS "roundId",r.conclusion FROM rms.acceptance_request q LEFT JOIN rms.evaluation_round r
    ON (r.tenant_id,r.project_id,r.acceptance_attempt)=(q.tenant_id,q.project_id,q.attempt) AND r.kind='ACCEPTANCE'
    WHERE q.project_id=$1 ORDER BY q.attempt DESC LIMIT 1`,[id])
  return {id,title:p.title,status:p.status_semantic,revision:p.row_version,principal:p.owner_id===a.id&&a.userType==="author",officer,
    finalPeriod:await finalPeriod(db,id),commitments:await productCommitments(db,id),attempt:request?.attempt??0,summary:request?.summary??null,
    decisionRevision:request?.decision_revision??0,roundId:request?.roundId??null,conclusion:request?.conclusion??null,
    files:await options("SELECT id,filename AS label FROM rms.attachment_intent WHERE project_id=$1 AND attached_at IS NOT NULL ORDER BY filename,id",[id]),
    committees:officer?await options("SELECT id,name AS label FROM rms.committee WHERE kind='ACCEPTANCE' AND unit_id=$1 ORDER BY name,id",[p.unit_id]):[],
    criteria:officer?await options("SELECT id,name||' · v'||revision AS label FROM rms.intake_reference WHERE kind='criteria' AND active AND definition->>'type'='ACCEPTANCE' ORDER BY name,revision DESC"):[],
    accounts:officer?await options("SELECT id,email AS label FROM rms.account WHERE unit_id=$1 AND is_active AND deleted_at IS NULL ORDER BY email",[p.unit_id]):[]}
}
export async function requestAcceptance(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"requestAcceptance">){
  const p=await projectAccess(db,a,id,true)
  if(a.userType!=="author"||a.id!==p.owner_id)throw new ForbiddenException()
  if(p.status_semantic!=="IN_PROGRESS")throw new ConflictException("Đề tài chưa ở bước đăng ký nghiệm thu.")
  const period=await finalPeriod(db,id)
  if(period?.status!=="PASSED")throw new ConflictException("Báo cáo kỳ cuối chưa đạt.")
  const requirements=await productCommitments(db,id),missing=requirements.filter(c=>c.missing>0)
  if(!requirements.length||missing.length)throw new ConflictException("Thiếu sản phẩm cam kết "+missing.map(c=>c.kind+" × "+c.missing).join(", "))
  if(!uuid.test(cmd?.fileId??"")||typeof cmd.summary!=="string"||!cmd.summary.trim()||cmd.summary.length>20000||
    !(await db.query("SELECT id FROM rms.attachment_intent WHERE project_id=$1 AND id=$2 AND attached_at IS NOT NULL",[id,cmd.fileId])).rowCount)
    throw new BadRequestException("Cần tóm tắt và tệp hồ sơ cuối của đúng đề tài.")
  const {rows:[request]}=await db.query(`INSERT INTO rms.acceptance_request(tenant_id,project_id,attempt,file_id,submitter,period_id,summary,commitments)
    SELECT rms.current_tenant(),$1,1+coalesce(max(attempt),0),$2,$3,$4,$5,$6 FROM rms.acceptance_request WHERE project_id=$1 RETURNING attempt`,
    [id,cmd.fileId,a.id,period.id,cmd.summary.trim(),JSON.stringify(requirements)])
  await moveTo(db,a,id,"PENDING_ACCEPTANCE",p.row_version)
  const audit=await appendAudit(db,a,"project",id,"ACCEPTANCE_REQUESTED",{attempt:request.attempt,fileId:cmd.fileId,periodId:period.id,requirements})
  await notifyRecipients(db,"ACCEPTANCE_REQUESTED",id,audit,await unitOfficers(db,p.unit_id),{attempt:request.attempt})
  return acceptanceDetail(db,a,id)
}
export async function openAcceptance(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"openAcceptance">){
  const p=await officerSource(db,a,id),detail=await acceptanceDetail(db,a,id)
  if(p.status_semantic==="UNDER_ACCEPTANCE"&&detail.roundId)return managedRound(db,a,detail.roundId,false,"ACCEPTANCE")
  if(p.status_semantic!=="PENDING_ACCEPTANCE"||!detail.attempt)throw new ConflictException("Chưa có hồ sơ chờ nghiệm thu.")
  if(!uuid.test(cmd?.committeeId??"")||!uuid.test(cmd?.criteriaId??""))throw new BadRequestException()
  const {rows:[criteria]}=await db.query("SELECT id,revision,definition FROM rms.intake_reference WHERE id=$1 AND active AND kind='criteria' FOR SHARE",[cmd.criteriaId])
  if(!criteria)throw new ConflictException("Bộ tiêu chí chưa hiệu lực.")
  rubric(criteria.definition,"ACCEPTANCE")
  if(!detail.committees.some(c=>c.id===cmd.committeeId))throw new NotFoundException()
  const {rows:[round]}=await db.query("INSERT INTO rms.evaluation_round(tenant_id,project_id,committee_id,kind,criteria,ethics,acceptance_attempt) VALUES(rms.current_tenant(),$1,$2,'ACCEPTANCE',$3,'EXEMPT',$4) RETURNING id",[id,cmd.committeeId,criteria,detail.attempt])
  if(!(await db.query("SELECT 1 FROM rms.eligible_reviewer WHERE round_id=$1 LIMIT 1",[round.id])).rowCount)throw new ConflictException("Cần thành viên đủ điều kiện chấm.")
  await moveTo(db,a,id,"UNDER_ACCEPTANCE",p.row_version)
  await appendAudit(db,a,"project",id,"ACCEPTANCE_OPENED",{roundId:round.id,criteriaId:criteria.id,revision:criteria.revision,attempt:detail.attempt})
  return managedRound(db,a,round.id,false,"ACCEPTANCE")
}
export function concludeAcceptance(db:PoolClient,a:SessionAccount,id:string,policy:ReviewPolicy,expectedRevision=0){return conclude(db,a,id,policy,"ACCEPTANCE",expectedRevision)}
export async function acceptanceQueue(db:PoolClient,a:SessionAccount):Promise<operations["getAcceptanceQueue"]["responses"][200]["content"]["application/json"]>{
  const {rows}=await db.query(`SELECT r.id,p.title,r.criteria->'definition'->'items' AS criteria,jsonb_build_object('summary',q.summary) AS document,
    CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('id',s.id,'points',s.points,'comment',s.comment,'total',s.total,'submitted',s.submitted_at IS NOT NULL) END AS sheet
    FROM rms.eligible_reviewer e JOIN rms.evaluation_round r ON (r.tenant_id,r.id)=(e.tenant_id,e.round_id)
    JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    JOIN rms.acceptance_request q ON (q.tenant_id,q.project_id,q.attempt)=(r.tenant_id,r.project_id,r.acceptance_attempt)
    LEFT JOIN rms.score_sheet s ON (s.tenant_id,s.round_id,s.account_id)=(e.tenant_id,e.round_id,e.account_id)
    WHERE e.account_id=$1 AND r.concluded_at IS NULL AND r.kind='ACCEPTANCE' AND p.status_semantic='UNDER_ACCEPTANCE' ORDER BY r.opened_at,r.id`,[a.id])
  return rows
}
export async function redoAcceptance(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"redoAcceptance">,limit:number,now=new Date()){
  const p=await officerSource(db,a,id),detail=await acceptanceDetail(db,a,id)
  if(p.status_semantic!=="FAILED"||detail.conclusion!=="FAILED"||!Number.isSafeInteger(limit)||limit<0||detail.attempt>limit)throw new ConflictException("Chưa thể làm lại hoặc đã hết số lần.")
  if(typeof cmd?.reason!=="string"||!cmd.reason.trim()||cmd.reason.length>2000||typeof cmd.deadline!=="string"||
    cmd.deadline<=new Date(now.getTime()+7*3600000).toISOString().slice(0,10))throw new BadRequestException("Cần lý do và hạn làm lại sau hôm nay.")
  await moveTo(db,a,id,"IN_PROGRESS",p.row_version,cmd.reason)
  await createPeriod(db,a,id,{period:(detail.finalPeriod?.period??0)+1,dueDate:cmd.deadline})
  await appendAudit(db,a,"project",id,"ACCEPTANCE_REDO",{attempt:detail.attempt,reason:cmd.reason,deadline:cmd.deadline})
  return acceptanceDetail(db,a,id)
}

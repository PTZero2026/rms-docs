import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"
import { validCommitments } from "@rms/api-contracts/products"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../iam/account.js"
import { moveTo } from "../workflow/move-to.js"
import { startProject } from "../workflow/kernel.js"
import { appendAudit } from "../audit/append.js"
import { projectAccess } from "./access.js"

type Input=operations["createDraftProposal"]["requestBody"]["content"]["application/json"]
type Proposal=operations["getProposal"]["responses"][200]["content"]["application/json"]
type Command=operations["actOnProposal"]["requestBody"]["content"]["application/json"]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
function canWithdraw(actor:SessionAccount,project:{owner_id:string;unit_id:string}){
  return (actor.userType==="author"&&actor.id===project.owner_id)||
    (actor.userType==="staff"&&actor.unitId===project.unit_id)
}
async function intake(db:PoolClient,id:string,at:Date) {
  const {rows:[call]}=await db.query(`SELECT id,code,source_snapshot, rms.receiving(status,start_date,end_date,$2) AS receiving
    FROM rms.proposal_call WHERE id=$1 FOR UPDATE`,[id,at])
  if(!call)throw new NotFoundException()
  if(!call.receiving)throw new ConflictException("Đã hết hạn nộp của kỳ hoặc kỳ chưa mở.")
  return call
}
function fieldList(form:{definition?:{fields?:Proposal["fields"]}}):Proposal["fields"] {
  const fields=form?.definition?.fields??[]
  if(!Array.isArray(fields)||fields.length>100 || fields.some(f=>!f || !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(f.key)||typeof f.label!=="string"||typeof f.required!=="boolean"))throw new ConflictException("Biểu mẫu của kỳ chưa hợp lệ.")
  return fields
}
function validate(input:Input,fields:Proposal["fields"],allowed:string[],owner:string,productCodes?:string[]) {
  if(!input || (input.commitments!==undefined&&!validCommitments(input.commitments,productCodes)) || typeof input.title!=="string" || !input.title.trim() || input.title.length>240 ||
     (input.fieldId!==null && !allowed.includes(input.fieldId)) ||
     (input.months!==null && (!Number.isSafeInteger(input.months)||input.months<1||input.months>2147483647)) ||
     (input.budget!==null && (!Number.isSafeInteger(input.budget)||input.budget<0)) ||
     !input.document || typeof input.document!=="object" || Array.isArray(input.document) ||
     Object.entries(input.document).some(([k,v])=>!fields.some(f=>f.key===k)||typeof v!=="string"||v.length>20000))throw new BadRequestException("Kiểm tra thông tin nháp và biểu mẫu của kỳ.")
  if(!Array.isArray(input.memberIds)||input.memberIds.length>100||input.memberIds.some(x=>typeof x!=="string"||!uuid.test(x))||
      new Set([owner,...input.memberIds]).size!==input.memberIds.length+1)throw new BadRequestException("Thành viên trùng hoặc không hợp lệ.")
}
async function members(db:PoolClient,id:string,owner:string,others:string[]) {
  const result=await db.query("SELECT id FROM rms.account WHERE id=ANY($1::uuid[]) AND is_active AND deleted_at IS NULL ORDER BY id FOR SHARE",[others])
  if(result.rowCount!==others.length)throw new BadRequestException("Thành viên không còn hiệu lực tại trường.")
  await db.query("DELETE FROM rms.project_member WHERE project_id=$1 AND NOT principal",[id])
  await db.query("INSERT INTO rms.project_member VALUES(rms.current_tenant(),$1,$2,true) ON CONFLICT DO NOTHING",[id,owner])
  await db.query("INSERT INTO rms.project_member SELECT rms.current_tenant(),$1,x,false FROM unnest($2::uuid[]) x",[id,others])
}
export async function proposal(db:PoolClient,actor:SessionAccount,id:string,now=new Date()):Promise<Proposal> {
  const p=await projectAccess(db,actor,id)
  const {rows:[v]}=await db.query(`SELECT p.call_id AS "callId",p.project_code AS "projectCode",p.submitted_at AS "submittedAt",
    i.version AS "templateVersion",d.field_id AS "fieldId",d.months,d.budget::float8 AS budget,d.document,d.form_snapshot,d.promised_products,
    CASE WHEN p.status_semantic='CANCELLED' THEN (
      SELECT h.reason FROM rms.workflow_history h WHERE (h.tenant_id,h.project_id,h.to_step)=(p.tenant_id,p.id,p.status)
      ORDER BY h.revision DESC LIMIT 1
    ) ELSE d.return_reason END AS reason,
    CASE WHEN p.status_semantic IN ('DRAFT','SUBMITTED') THEN (
      SELECT count(*)=1 FROM rms.workflow_edge e JOIN rms.workflow_step s
        ON (s.tenant_id,s.version,s.code)=(e.tenant_id,e.version,e.to_step)
      WHERE (e.tenant_id,e.version,e.from_step)=(i.tenant_id,i.version,i.current_step)
        AND s.semantic='CANCELLED' AND $3=ANY(e.roles)
    ) ELSE false END AS cancel_edge,
    CASE WHEN rms.receiving(c.status,c.start_date,c.end_date,$2)
      THEN (c.end_date+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' END AS submit_until,
    c.source_snapshot->'fields' AS available
    FROM rms.research_project p JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    JOIN rms.workflow_instance i ON (i.tenant_id,i.project_id)=(p.tenant_id,p.id)
    JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id) WHERE p.id=$1`,[id,now,actor.userType])
  if(!v)throw new NotFoundException()
  const {rows:team}=await db.query<Proposal["members"][number]>(`SELECT a.id,a.email,m.principal FROM rms.project_member m
    JOIN rms.account a ON (a.tenant_id,a.id)=(m.tenant_id,m.account_id) WHERE m.project_id=$1 ORDER BY m.principal DESC,a.email`,[id])
  const canEdit=actor.userType==="author"&&actor.id===p.owner_id&&p.status_semantic==="DRAFT"
  return {id,title:p.title,callId:v.callId,projectCode:v.projectCode,submittedAt:v.submittedAt,semantic:p.status_semantic,step:p.status,revision:p.row_version,
    templateVersion:v.templateVersion,fieldId:v.fieldId,months:v.months,budget:v.budget,document:v.document,fields:fieldList(v.form_snapshot),
    commitments:v.promised_products,fieldOptions:v.available.map(({id,name}:{id:string;name:string})=>({id,name})),members:team,memberIds:team.filter(m=>!m.principal).map(m=>m.id),reason:v.reason,
    canEdit,submitUntil:canEdit&&v.submit_until?v.submit_until.toISOString():null,
    canCancel:v.cancel_edge&&canWithdraw(actor,p),
    canReturn:actor.userType==="staff"&&actor.unitId===p.unit_id&&p.status_semantic==="SUBMITTED"}
}
export async function createDraft(db:PoolClient,actor:SessionAccount,callId:string,input:Input,now=new Date(),productCodes?:string[]) {
  if(actor.userType!=="author"||!actor.unitId)throw new ForbiddenException("Chủ nhiệm cần có đơn vị công tác.")
  const call=await intake(db,callId,now),form=call.source_snapshot?.form
  validate(input,fieldList(form),call.source_snapshot.fields.map((f:{id:string})=>f.id),actor.id,productCodes)
  const id=randomUUID()
  await startProject(db,actor,{id,unitId:actor.unitId,title:input.title.trim()})
  await db.query("UPDATE rms.research_project SET call_id=$2 WHERE id=$1",[id,callId])
  await db.query(`INSERT INTO rms.proposal_document(tenant_id,project_id,field_id,months,budget,document,form_snapshot,promised_products)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7)`,[id,input.fieldId,input.months,input.budget,input.document,form,input.commitments??{}])
  await members(db,id,actor.id,input.memberIds)
  return proposal(db,actor,id,now)
}
export async function editDraft(db:PoolClient,actor:SessionAccount,id:string,input:Input,now=new Date(),productCodes?:string[]) {
  const p=await projectAccess(db,actor,id,true)
  if(actor.userType!=="author"||actor.id!==p.owner_id)throw new ForbiddenException()
  const current=await proposal(db,actor,id,now)
  if(current.semantic!=="DRAFT" || current.revision!==input?.revision)throw new ConflictException("Hồ sơ đã nộp hoặc đã thay đổi.")
  if(current.projectCode){
    const result=await db.query("SELECT rms.receiving(status,start_date,end_date,$2) AS allowed FROM rms.proposal_call WHERE id=$1",[current.callId,now])
    if(!result.rows[0].allowed)throw new ConflictException("Đã hết hạn bổ sung.")
  }
  const retained=Object.entries(current.commitments??{}).filter(([code,quantity])=>input.commitments?.[code]===quantity).map(([code])=>code)
  validate(input,current.fields,current.fieldOptions.map(x=>x.id),actor.id,productCodes&&[...productCodes,...retained])
  await db.query("UPDATE rms.research_project SET title=$2,row_version=row_version+1 WHERE id=$1",[id,input.title.trim()])
  await db.query("UPDATE rms.proposal_document SET field_id=$2,months=$3,budget=$4,document=$5,promised_products=coalesce($6,promised_products) WHERE project_id=$1",[id,input.fieldId,input.months,input.budget,input.document,input.commitments??null])
  await members(db,id,actor.id,input.memberIds)
  await appendAudit(db,actor,"project",id,"PROPOSAL_DRAFT_SAVED",{revision:current.revision+1})
  return proposal(db,actor,id,now)
}
function complete(p:Proposal) {
  const absent=[...(!p.fieldOptions.some(f=>f.id===p.fieldId)?["Lĩnh vực"]:[]),...(p.months===null?["Thời gian thực hiện"]:[]),...(p.budget===null?["Kinh phí đề xuất"]:[]),
    ...p.fields.filter(f=>f.required&&!p.document[f.key]?.trim()).map(f=>f.label)]
  if(absent.length)throw new BadRequestException("Còn thiếu "+absent.join(", ")+".")
}
export async function actOnProposal(db:PoolClient,actor:SessionAccount,id:string,cmd:Command,now=new Date()) {
  if(!cmd || !Number.isSafeInteger(cmd.revision) || !["submit","return","cancel"].includes(cmd.action))throw new BadRequestException()
  if(cmd.action==="cancel"){
    const p=await projectAccess(db,actor,id,true)
    if(!p.hasProposal)throw new NotFoundException()
    if(!canWithdraw(actor,p))throw new ForbiddenException()
    if(p.row_version!==cmd.revision)throw new ConflictException("Phiên bản hồ sơ đã thay đổi.")
    if(!["DRAFT","SUBMITTED"].includes(p.status_semantic))throw new ConflictException("Chỉ hủy được đề xuất nháp hoặc đã nộp trước xét duyệt.")
    if(typeof cmd.reason!=="string"||cmd.reason.length>4000||!cmd.reason.replace(/[\p{Z}\p{C}]/gu,""))throw new BadRequestException("Cần ghi lý do hủy đề xuất.")
    await moveTo(db,actor,id,"CANCELLED",cmd.revision,cmd.reason.trim())
    return proposal(db,actor,id,now)
  }
  // Resolve scope without locking the project. Intake writes lock call first, project second.
  const {rows:[source]}=await db.query(`SELECT call_id FROM rms.research_project WHERE id=$1 AND
    (($2='author' AND owner_id=$3) OR $2='admin' OR ($2='staff' AND unit_id=$4))`,[id,actor.userType,actor.id,actor.unitId])
  if(!source?.call_id)throw new NotFoundException()
  if(cmd.action==="submit" && actor.userType!=="author" || cmd.action==="return" && actor.userType!=="staff")throw new ForbiddenException()
  const call=await intake(db,source.call_id,now)
  const p=await projectAccess(db,actor,id,true), current=await proposal(db,actor,id,now)
  if(cmd.action==="submit" && current.semantic==="SUBMITTED" && current.revision===cmd.revision+1 && p.owner_id===actor.id)return current
  if(current.revision!==cmd.revision)throw new ConflictException("Phiên bản hồ sơ đã thay đổi.")
  if(cmd.action==="return"){
    if(!current.canReturn)throw new ConflictException("Hồ sơ chưa ở bước Đã nộp.")
    if(typeof cmd.reason!=="string" || !cmd.reason.replace(/[\p{Z}\p{C}]/gu,"").length || cmd.reason.length>4000)throw new BadRequestException("Cần ghi lý do trả hồ sơ.")
    await moveTo(db,actor,id,"DRAFT",cmd.revision,cmd.reason)
    await db.query("UPDATE rms.proposal_document SET return_reason=$2,finalized_at=NULL,finalized_by=NULL WHERE project_id=$1",[id,cmd.reason])
  }else{
    if(!current.canEdit)throw new ConflictException("Hồ sơ chưa ở bước Nháp.")
    complete(current)
    await moveTo(db,actor,id,"SUBMITTED",cmd.revision,undefined,async()=>complete(current))
    let code=current.projectCode
    if(!code){
      const {rows:[seq]}=await db.query("UPDATE rms.proposal_call SET next_number=next_number+1 WHERE id=$1 RETURNING next_number-1 AS n,tenant_id",[call.id])
      code=seq.tenant_id+"-"+call.code+"-"+String(seq.n).padStart(4,"0")
    }
    await db.query("UPDATE rms.research_project SET project_code=$2,submitted_at=$3 WHERE id=$1",[id,code,now])
    await db.query("UPDATE rms.proposal_document SET return_reason=NULL WHERE project_id=$1",[id])
  }
  return proposal(db,actor,id,now)
}

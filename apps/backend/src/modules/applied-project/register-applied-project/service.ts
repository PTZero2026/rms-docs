import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../../iam/account.js"
import {appendAudit} from "../../audit/append.js"

import {calendarDay} from "@rms/api-contracts/teaching-calendar"
import {resolveContributions} from "../../teaching-hour/contributions.js"
import {revokeSourceHours} from "../../teaching-hour/revoke.js"
import {enqueueAppliedHours} from "../../teaching-hour/teaching-hours/service.js"
import {selectPartners} from "./partners.js"
import type {Rules} from "../../extension/entries.js"
const noRules:Rules={types:[],evidence:[],bodies:[]}
type Decision=operations["reviewAppliedProject"]["requestBody"]["content"]["application/json"]
type Page=operations["listAppliedProjects"]["responses"][200]["content"]["application/json"]
type Entry=Page["items"][number]
type Draft=operations["saveAppliedProject"]["requestBody"]["content"]["application/json"]
const fields=`SELECT p.id,p.owner_id AS "ownerId",p.unit_id AS "unitId",u.name AS unit,p.title,p.status,p.revision,p.reason,p.category,p.partners,p.directory_partners AS "directoryPartners",p.hour_trigger AS "hourTrigger",
  CASE WHEN p.status='APPROVED' THEN coalesce(p.approval_revision,p.revision) END AS "approvalRevision",
  p.result_status AS "resultStatus",p.result_date::text AS "resultDate",p.result_summary AS "resultSummary",
  coalesce((SELECT jsonb_agg(jsonb_build_object('email',a.email,'role',m.role,'share',m.share) ORDER BY a.email)
    FROM rms.applied_member m JOIN rms.account a ON (a.tenant_id,a.id)=(m.tenant_id,m.account_id)
    WHERE (p.tenant_id,p.id)=(m.tenant_id,m.project_id)),'[]') AS members,
  coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'filename',f.filename,'code',f.evidence_type,'cycle',f.applied_cycle) ORDER BY f.created_at,f.id) FROM rms.attachment_intent f
    WHERE (f.tenant_id,f.applied_id)=(p.tenant_id,p.id) AND f.attached_at IS NOT NULL),'[]') AS files,p.total_budget_vnd::text AS amount
  FROM rms.applied_project p JOIN rms.unit u ON (p.tenant_id,p.unit_id)=(u.tenant_id,u.id)
  WHERE ($1='admin' OR p.owner_id=$2 OR $1='staff' AND p.unit_id=$3)`
const scope=(a:SessionAccount)=>[a.userType,a.id,a.unitId]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
export async function appliedRecord(db:PoolClient,a:SessionAccount,id:string,lock=false){
  const {rows:[item]}=await db.query<Entry>(fields+" AND p.id=$4"+(lock?" FOR UPDATE OF p":""),[...scope(a),id])
  if(!item)throw new NotFoundException()
  return item
}
export async function listApplied(db:PoolClient,a:SessionAccount,catalog:Rules=noRules,hoursEnabled=false,partnerDirectory:Page["partnerDirectory"]=[]):Promise<Page>{
  const items=await db.query<Entry>(fields+" ORDER BY p.title,p.id",scope(a))
  const units=await db.query<Page["units"][number]>("SELECT id,name FROM rms.unit WHERE $1='admin' OR id=$2 ORDER BY name,id",[a.userType,a.unitId])
  return {items:items.rows,units:units.rows,catalog,partnerDirectory,actorId:a.id,canReview:a.userType==="admin"||a.userType==="staff",hoursEnabled}
}
export async function appliedHours(db:PoolClient,a:SessionAccount,id:string){
  const source=await appliedRecord(db,a,id)
  const {rows}=await db.query<operations["getAppliedHours"]["responses"][200]["content"]["application/json"][number]>(`
    SELECT a.email,q.role,q.share,r.period_code AS period,f.version,
      (r.hours+coalesce((SELECT sum(delta) FROM rms.hour_adjustment h WHERE (h.tenant_id,h.record_id)=(r.tenant_id,r.id)),0))::numeric(14,2)::text AS hours
    FROM rms.hour_request q JOIN rms.account a ON (a.tenant_id,a.id)=(q.tenant_id,q.recipient)
    LEFT JOIN rms.hour_record r ON (r.tenant_id,r.request_id)=(q.tenant_id,q.id)
    LEFT JOIN rms.hour_formula f ON (f.tenant_id,f.id)=(r.tenant_id,r.formula_id)
    WHERE q.applied_id=$1 AND q.source_revision=$2 ORDER BY a.email`,[id,source.approvalRevision])
  return rows
}
export async function saveApplied(db:PoolClient,a:SessionAccount,id:string,cmd:Draft,catalog:Rules=noRules,partnerDirectory:Page["partnerDirectory"]=[]){
  if(a.userType==="user")throw new ForbiddenException()
  if(!cmd||typeof cmd.unitId!=="string"||!uuid.test(cmd.unitId))throw new BadRequestException("Chọn đơn vị chủ trì.")
  if(typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>500||typeof cmd.amount!=="string"||!/^\d{1,18}$/.test(cmd.amount)||
    !Array.isArray(cmd.partners)||cmd.partners.length>50||cmd.partners.some(s=>typeof s!=="string"||!s.trim()||s.length>240)||!Number.isSafeInteger(cmd.revision)||cmd.revision<0)
    throw new BadRequestException("Kiểm tra tên, tổng kinh phí và danh sách đối tác.")
  if(a.userType!=="admin"&&a.unitId!==cmd.unitId)throw new ForbiddenException()
  if(!(await db.query("SELECT 1 FROM rms.unit WHERE id=$1",[cmd.unitId])).rowCount)throw new BadRequestException("Đơn vị chưa được đăng ký.")
  if(cmd.category!==undefined&&typeof cmd.category!=="string")throw new BadRequestException("Loại dự án không hợp lệ.")
  const category=cmd.category?.trim()??null
  if(category&&!catalog.types.some(t=>t.code===category))throw new BadRequestException("Loại dự án ngoài danh mục của trường.")
  const previous=cmd.revision>0?await appliedRecord(db,a,id,true):undefined
  if(previous){
    if(a.id!==previous.ownerId&&a.userType!=="admin"&&a.userType!=="staff")throw new ForbiddenException()
    if(previous.revision!==cmd.revision||previous.status!=="DRAFT")throw new ConflictException("Bản nháp đã thay đổi hoặc đã gửi.")
  }
  const partners=selectPartners(cmd.partners,cmd.partnerCodes,partnerDirectory,previous?.directoryPartners??[])
  const args=[id,cmd.unitId,cmd.title.trim(),partners.names,cmd.amount,category,JSON.stringify(partners.selected)]
  if(previous){
    await db.query("UPDATE rms.applied_project SET unit_id=$2,title=$3,partners=$4,total_budget_vnd=$5,category=coalesce($6,category),directory_partners=$7,revision=revision+1 WHERE id=$1",args)
  }else{
    const insert=await db.query("INSERT INTO rms.applied_project(tenant_id,id,unit_id,title,partners,total_budget_vnd,category,directory_partners,owner_id) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,coalesce($6,''),$7,$8) ON CONFLICT DO NOTHING",[...args,a.id])
    if(!insert.rowCount)throw new ConflictException("Mã dự án đã tồn tại.")
  }
  if(cmd.members!==undefined){
    const saved=await appliedRecord(db,a,id)
    const members=await resolveContributions(db,saved.ownerId,cmd.members)
    if(members.some(m=>!["MEMBER","SECRETARY"].includes(m.role)))throw new BadRequestException("Chọn vai trò thành viên hoặc thư ký.")
    await db.query("DELETE FROM rms.applied_member WHERE project_id=$1",[id])
    await db.query(`INSERT INTO rms.applied_member SELECT rms.current_tenant(),$1,id,role,share
      FROM unnest($2::uuid[],$3::text[],$4::int[]) AS m(id,role,share)`,[id,members.map(m=>m.accountId),members.map(m=>m.role),members.map(m=>m.share)])
  }
  await appendAudit(db,a,"applied-project",id,"APPLIED_PROJECT_SAVED",{unitId:cmd.unitId,amount:cmd.amount,revision:cmd.revision+1})
  return appliedRecord(db,a,id)
}
export async function submitApplied(db:PoolClient,a:SessionAccount,id:string,revision:number){
  const entry=await appliedRecord(db,a,id,true)
  if(a.userType==="user")throw new ForbiddenException()
  if(entry.status!=="DRAFT"||entry.revision!==revision)throw new ConflictException("Bản nháp đã thay đổi hoặc đã gửi.")
  if(!entry.partners.length)throw new BadRequestException("Cần ít nhất một đối tác ngoài trước khi gửi duyệt.")
  await db.query("UPDATE rms.applied_project SET status='PENDING',revision=revision+1 WHERE id=$1",[id])
  await appendAudit(db,a,"applied-project",id,"APPLIED_PROJECT_SUBMITTED",{revision:revision+1,unitId:entry.unitId})
  return appliedRecord(db,a,id)
}

type ResultInput=operations["submitAppliedResult"]["requestBody"]["content"]["application/json"]
type HourPolicy={enabled:boolean;trigger:Entry["hourTrigger"]}
export function resultCodes(rules:Rules,category:string){
  const selected=rules.types.find(t=>t.code===category)
  if(!selected)throw new ConflictException("Cần loại dự án đang hiệu lực trong danh mục của trường.")
  return selected.resultEvidence??["ACCEPTANCE_MINUTES"]
}
function resultFiles(source:Entry,rules:Rules){
  const allowed=resultCodes(rules,source.category)
  const files=source.files.filter(f=>f.cycle===source.approvalRevision&&allowed.includes(f.code)&&rules.evidence.some(e=>e.code===f.code))
  if(!files.length)throw new BadRequestException("Cần minh chứng kết quả của lần duyệt này: "+allowed.join(" hoặc "))
  return files.map(f=>f.id)
}

export async function submitAppliedResult(db:PoolClient,a:SessionAccount,id:string,cmd:ResultInput,rules:Rules){
  const source=await appliedRecord(db,a,id,true)
  if(source.ownerId!==a.id||a.userType==="user")throw new ForbiddenException()
  if(source.status!=="APPROVED"||source.resultStatus!=="DRAFT"||source.revision!==cmd?.revision)throw new ConflictException("Hồ sơ kết quả đã thay đổi.")
  if(!calendarDay(cmd.date)||typeof cmd.summary!=="string"||!cmd.summary.trim()||cmd.summary.length>10000)
    throw new BadRequestException("Cần ngày nghiệm thu và tóm tắt kết quả.")
  if(!(await db.query("SELECT $1::date<=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS valid",[cmd.date])).rows[0].valid)
    throw new BadRequestException("Ngày nghiệm thu phải đến thời điểm hiện tại.")
  const files=resultFiles(source,rules)
  await db.query(`UPDATE rms.applied_project SET approval_revision=coalesce(approval_revision,revision),
    result_status='PENDING',result_date=$2,result_summary=$3,reason='',revision=revision+1 WHERE id=$1`,[id,cmd.date,cmd.summary.trim()])
  await appendAudit(db,a,"applied-project",id,"APPLIED_PROJECT_RESULT_SUBMITTED",{date:cmd.date,summary:cmd.summary.trim(),files,revision:cmd.revision+1})
  return appliedRecord(db,a,id)
}

export async function decideApplied(db:PoolClient,a:SessionAccount,id:string,cmd:Decision,rules:Rules,
  policy:HourPolicy={enabled:false,trigger:"ON_RESULT_APPROVED"}){
  const source=await appliedRecord(db,a,id,true)
  if(source.ownerId===a.id||!(a.userType==="admin"||a.userType==="staff"&&a.unitId===source.unitId))throw new ForbiddenException()
  if(!cmd||!["return","approve","revoke","confirmResult","returnResult"].includes(cmd.action)||typeof cmd.reason!=="string"||cmd.reason.length>2000)throw new BadRequestException()
  if(source.revision!==cmd.revision)throw new ConflictException("Phiên bản dự án đã thay đổi.")
  const reason=cmd.reason.trim()
  if(["return","revoke","returnResult"].includes(cmd.action)&&!reason)throw new BadRequestException("Cần lý do trả lại hoặc thu hồi.")
  const revision=source.revision+1
  if(cmd.action==="returnResult"||cmd.action==="confirmResult"){
    if(source.status!=="APPROVED"||source.resultStatus!=="PENDING")throw new ConflictException("Kết quả chưa chờ xác nhận.")
    const confirm=cmd.action==="confirmResult",files=confirm?resultFiles(source,rules):[]
    await db.query("UPDATE rms.applied_project SET result_status=$2,reason=$3,revision=revision+1 WHERE id=$1",[id,confirm?"CONFIRMED":"DRAFT",reason])
    if(confirm&&policy.enabled&&source.hourTrigger==="ON_RESULT_APPROVED")await enqueueAppliedHours(db,id)
    await appendAudit(db,a,"applied-project",id,confirm?"APPLIED_PROJECT_RESULT_APPROVED":"APPLIED_PROJECT_RESULT_RETURNED",
      {revision,reason,files,date:source.resultDate,approvalRevision:source.approvalRevision})
    return appliedRecord(db,a,id)
  }
  if(source.status!==(cmd.action==="revoke"?"APPROVED":"PENDING"))throw new ConflictException("Dự án đã thay đổi.")
  if(cmd.action==="approve"){
    const category=rules.types.find(t=>t.code===source.category)
    if(!category)throw new ConflictException("Cần loại dự án đang hiệu lực trong danh mục của trường.")
    const missing=category.required.filter(code=>!source.files.some(f=>f.code===code&&f.cycle===null))
    if(missing.length)throw new BadRequestException("Thiếu minh chứng: "+missing.join(", "))
    await db.query(`UPDATE rms.applied_project SET status='APPROVED',approval_revision=revision+1,
      hour_trigger=$2,reason=$3,revision=revision+1 WHERE id=$1`,[id,policy.trigger,reason])
    if(policy.enabled&&policy.trigger==="ON_PROJECT_APPROVED")await enqueueAppliedHours(db,id)
  }else{
    if(cmd.action==="revoke")await revokeSourceHours(db,a,"applied-project",id,source.approvalRevision!,reason)
    await db.query(`UPDATE rms.applied_project SET status='DRAFT',result_status='DRAFT',result_date=NULL,result_summary='',
      approval_revision=NULL,reason=$2,revision=revision+1 WHERE id=$1`,[id,reason])
  }
  const event={approve:"APPLIED_PROJECT_APPROVED",return:"APPLIED_PROJECT_RETURNED",revoke:"APPLIED_PROJECT_REVOKED"}[cmd.action]
  await appendAudit(db,a,"applied-project",id,event,{reason,revision,unitId:source.unitId,hourTrigger:cmd.action==="approve"?policy.trigger:source.hourTrigger})
  return appliedRecord(db,a,id)
}

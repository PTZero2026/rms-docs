import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import { validCommitments } from "@rms/api-contracts/products"
import type { operations } from "@rms/api-contracts"
import { appendAudit } from "../audit/append.js"
import type { SessionAccount } from "../iam/account.js"
import { projectAccess } from "../proposal/access.js"
import { moveTo } from "../workflow/move-to.js"

type Detail=operations["getProgress"]["responses"][200]["content"]["application/json"]
type Period=Detail["periods"][number]
type Body<K extends "assignProject"|"createReportPeriod"|"submitProgress"|"reviewProgress"|"changeProjectActivity">=operations[K]["requestBody"]["content"]["application/json"]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
const dayVN=(d:Date)=>new Date(d.getTime()+7*3600000).toISOString().slice(0,10)
function validDate(v:unknown):v is string{
  if(typeof v!=="string" || !/^\d{4}-\d\d-\d\d$/.test(v))return false
  const day=new Date(v+"T00:00:00Z")
  return Number.isFinite(day.getTime())&&day.toISOString().slice(0,10)===v
}
function positive(n:unknown):n is number{return typeof n==="number" && Number.isSafeInteger(n)&&n>0}
function textField(s:unknown,max:number):s is string{return typeof s==="string"&&s.trim().length>0&&s.length<=max}
async function source(db:PoolClient,a:SessionAccount,id:string,permission:"manage"|"submit"){
  if(permission==="manage"&&a.userType!=="staff" || permission==="submit"&&a.userType!=="author")throw new ForbiddenException()
  const p=await projectAccess(db,a,id,true)
  if(permission==="manage"&&(p.unit_id!==a.unitId||p.owner_id===a.id) || permission==="submit"&&p.owner_id!==a.id)throw new ForbiddenException()
  return p
}
async function evidence(db:PoolClient,project:string,file:string) {
  if(!uuid.test(file??""))throw new BadRequestException("Tệp căn cứ còn thiếu.")
  const f=await db.query("SELECT id FROM rms.attachment_intent WHERE project_id=$1 AND id=$2 AND attached_at IS NOT NULL",[project,file])
  if(!f.rowCount)throw new BadRequestException("Tệp căn cứ chưa xác nhận cho đề tài này.")
}
const periodFields=`id,period,due_date::text AS "dueDate",status,submitted_at AS "submittedAt",content,officer_comment AS comment,file_id AS "fileId",revision,
  CASE WHEN status IN ('PENDING_SUBMISSION','REVISION_REQUESTED') THEN ($2::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date>due_date
  ELSE (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date>due_date END AS late`
async function periodAt(db:PoolClient,project:string,id:string,now:Date,write=false):Promise<Period>{
  const {rows:[period]}=await db.query<Period>("SELECT "+periodFields+" FROM rms.progress_period WHERE project_id=$1 AND id=$3"+(write?" FOR UPDATE":""),[project,now,id])
  if(!period)throw new NotFoundException()
  return period
}
export async function progressDetail(db:PoolClient,a:SessionAccount,id:string,now=new Date()):Promise<Detail>{
  const p=await projectAccess(db,a,id)
  const {rows:[assignment]}=await db.query(`SELECT reference,signed::text,effective::text,starts::text AS start,ends::text AS end,budget::float8,
    note,commitments,file_id AS "fileId" FROM rms.project_assignment WHERE project_id=$1`,[id])
  const {rows:periods}=await db.query<Period>("SELECT "+periodFields+" FROM rms.progress_period WHERE project_id=$1 ORDER BY period",[id,now])
  const {rows:files}=await db.query("SELECT id,filename FROM rms.attachment_intent WHERE project_id=$1 AND attached_at IS NOT NULL ORDER BY attached_at DESC,id",[id])
  const {rows:[proposal]}=await db.query("SELECT promised_products FROM rms.proposal_document WHERE project_id=$1",[id])
  return {id,title:p.title,status:p.status_semantic,revision:p.row_version,canManage:a.userType==="staff"&&a.unitId===p.unit_id&&a.id!==p.owner_id,
    principal:a.userType==="author"&&a.id===p.owner_id,assignment:assignment??null,periods,files,promised:proposal?.promised_products??{}}
}
export async function assignProject(db:PoolClient,a:SessionAccount,id:string,input:Body<"assignProject">,now=new Date(),productCodes?:string[]){
  const p=await source(db,a,id,"manage")
  if(p.status_semantic!=="APPROVED")throw new ConflictException("Đề tài cần được phê duyệt và chưa giao thực hiện.")
  if(!textField(input?.reference,240))throw new BadRequestException("Cần số quyết định hoặc hợp đồng.")
  if(![input.signed,input.effective,input.start,input.end].every(validDate)||input.signed>input.effective||input.effective>dayVN(now)||input.start>input.end)
    throw new BadRequestException("Kiểm tra ngày ký, ngày hiệu lực và thời gian thực hiện.")
  if(!positive(input.budget))throw new BadRequestException("Kinh phí giao phải là số nguyên VND dương.")
  if(typeof input.note!=="string"||input.note.length>4000)throw new BadRequestException("Ghi chú quá dài hoặc thiếu.")
  await evidence(db,id,input.fileId)
  const {rows:[proposal]}=await db.query("SELECT months,budget::float8,promised_products FROM rms.proposal_document WHERE project_id=$1",[id])
  const months=Math.round((Date.parse(input.end)-Date.parse(input.start)+86400000)/(86400000*30.4375))
  if(((proposal?.months!=null&&proposal.months!==months)||(proposal?.budget!=null&&proposal.budget!==input.budget))&&!input.note.trim())
    throw new BadRequestException("Cần lý do điều chỉnh thời gian hoặc kinh phí.")
  const promisedCodes=Object.keys(proposal?.promised_products??{})
  const commitments=promisedCodes.length?proposal.promised_products:input.commitments
  if(!validCommitments(commitments,promisedCodes.length?promisedCodes:productCodes)||!Object.keys(commitments).length)throw new BadRequestException("Cần xác nhận loại và số lượng sản phẩm cam kết.")
  await db.query(`INSERT INTO rms.project_assignment(tenant_id,project_id,reference,signed,effective,starts,ends,budget,note,commitments,file_id)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[id,input.reference.trim(),input.signed,input.effective,input.start,input.end,input.budget,input.note.trim(),commitments,input.fileId])
  await moveTo(db,a,id,"IN_PROGRESS",p.row_version)
  await appendAudit(db,a,"project",id,"ASSIGNMENT_EFFECTIVE",{reference:input.reference,budget:input.budget,fileId:input.fileId,reason:input.note})
  return progressDetail(db,a,id,now)
}
export async function changeActivity(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"changeProjectActivity">){
  const p=await source(db,a,id,"manage")
  if(!cmd||!["suspend","resume"].includes(cmd.action)||!textField(cmd.reason,4000))throw new BadRequestException("Cần thao tác và lý do điều chỉnh.")
  if(p.status_semantic!==(cmd.action==="resume"?"SUSPENDED":"IN_PROGRESS"))throw new ConflictException("Đề tài đã thay đổi trạng thái.")
  await moveTo(db,a,id,cmd.action==="resume"?"IN_PROGRESS":"SUSPENDED",p.row_version,cmd.reason)
  return progressDetail(db,a,id)
}
function executing(status:string){
  if(status!=="IN_PROGRESS")throw new ConflictException(status==="SUSPENDED"?"Đề tài đang tạm dừng.":"Đề tài chưa ở bước thực hiện.")
}
export async function createPeriod(db:PoolClient,a:SessionAccount,id:string,input:Body<"createReportPeriod">){
  const p=await source(db,a,id,"manage");executing(p.status_semantic)
  if(!positive(input?.period)||input.period>2147483647||!validDate(input.dueDate))throw new BadRequestException("Cần số kỳ dương và ngày đến hạn.")
  const {rows:[newPeriod]}=await db.query(`INSERT INTO rms.progress_period(tenant_id,project_id,period,due_date) VALUES(rms.current_tenant(),$1,$2,$3)
    ON CONFLICT(tenant_id,project_id,period) DO NOTHING RETURNING id`,[id,input.period,input.dueDate])
  if(!newPeriod)throw new ConflictException("Số kỳ đã tồn tại trong đề tài.")
  await appendAudit(db,a,"project",id,"PROGRESS_PERIOD_CREATED",{periodId:newPeriod.id,period:input.period,dueDate:input.dueDate})
  return periodAt(db,id,newPeriod.id,new Date())
}
export async function submitPeriod(db:PoolClient,a:SessionAccount,id:string,periodId:string,input:Body<"submitProgress">,now=new Date()){
  const p=await source(db,a,id,"submit");executing(p.status_semantic)
  const period=await periodAt(db,id,periodId,now,true)
  if(!["PENDING_SUBMISSION","REVISION_REQUESTED"].includes(period.status)||period.revision!==input?.revision)throw new ConflictException("Kỳ không nhận báo cáo hoặc phiên bản đã thay đổi.")
  if(!textField(input.content,40000))throw new BadRequestException("Cần nhập nội dung thực hiện.")
  await evidence(db,id,input.fileId)
  await db.query(`UPDATE rms.progress_period SET status='SUBMITTED',submitted_at=$2,content=$3,file_id=$4,revision=revision+1 WHERE id=$1`,[periodId,now,input.content.trim(),input.fileId])
  await db.query("INSERT INTO rms.progress_submission VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6)",[periodId,period.revision+1,a.id,now,input.content.trim(),input.fileId])
  await appendAudit(db,a,"project",id,"PROGRESS_SUBMITTED",{periodId,revision:period.revision+1,fileId:input.fileId})
  return periodAt(db,id,periodId,now)
}
export async function reviewPeriod(db:PoolClient,a:SessionAccount,id:string,periodId:string,input:Body<"reviewProgress">){
  const p=await source(db,a,id,"manage");executing(p.status_semantic)
  const now=new Date(),period=await periodAt(db,id,periodId,now,true)
  if(!input||!["pass","return","reopen"].includes(input.action)||typeof input.reason!=="string"||input.reason.length>4000||
    (input.action!=="pass"&&!input.reason.trim()))throw new BadRequestException("Cần nhận xét khi trả hoặc mở lại báo cáo.")
  if(period.revision!==input.revision || period.status!==(input.action==="reopen"?"PASSED":"SUBMITTED"))throw new ConflictException("Kỳ đã thay đổi hoặc chưa thể duyệt.")
  const status=input.action==="pass"?"PASSED":"REVISION_REQUESTED"
  await db.query("UPDATE rms.progress_period SET status=$2,officer_comment=$3,revision=revision+1 WHERE id=$1",[periodId,status,input.reason.trim()])
  await appendAudit(db,a,"project",id,"PROGRESS_"+input.action.toUpperCase(),{periodId,from:period.status,to:status,reason:input.reason})
  return periodAt(db,id,periodId,now)
}

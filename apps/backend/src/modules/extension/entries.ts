import {resolveContributions} from "../teaching-hour/contributions.js"
import {revokeSourceHours} from "../teaching-hour/revoke.js"
import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"
import {money} from "../budget/money.js"
export type Kind="upper-project"|"activity"
type Page=operations["listEvidenceEntries"]["responses"][200]["content"]["application/json"]
export type Rules=Page["catalog"]
type Item=Page["items"][number]
export type Draft=operations["saveEvidenceEntry"]["requestBody"]["content"]["application/json"]
export type Decision=operations["changeEvidenceEntry"]["requestBody"]["content"]["application/json"]
export function moduleKind(s:string):Kind{if(s==="upper-project"||s==="activity")return s;throw new NotFoundException()}
export const moduleCode=(kind:Kind)=>kind==="upper-project"?"F09":"F12"
const validCode=(s:unknown)=>typeof s==="string"&&/^[-A-Za-z0-9_.]{1,80}$/.test(s)
export function readRules(text:string|null):Rules{
  if(text===null)return {types:[],evidence:[],bodies:[]}
  let r:Rules
  try{r=JSON.parse(text)}catch{throw new ConflictException("Danh mục minh chứng chưa hợp lệ.")}
  const choices=(v:Rules["bodies"])=>Array.isArray(v)&&v.length<=200&&v.every(x=>x&&validCode(x.code)&&typeof x.label==="string"&&x.label.trim()&&x.label.length<=200)&&new Set(v.map(x=>x.code)).size===v.length
  if(!r||!choices(r.bodies)||!choices(r.evidence)||!choices(r.types)||r.types.some(t=>!Array.isArray(t.required)||t.required.some(code=>!r.evidence.some(e=>e.code===code))))throw new ConflictException("Kiểm tra loại và danh mục minh chứng của trường.")
  if(r.types.some(t=>t.resultEvidence!==undefined&&(!Array.isArray(t.resultEvidence)||!t.resultEvidence.length||
    new Set(t.resultEvidence).size!==t.resultEvidence.length||t.resultEvidence.some(code=>!r.evidence.some(e=>e.code===code)))))
    throw new ConflictException("Loại minh chứng kết quả chưa có trong danh mục.")
  return r
}
const readable=`SELECT e.id,e.title,e.category,e.managing_body AS body,e.source_date::text AS date,e.host_id AS "hostId",
  e.owner_id AS "ownerId",e.unit_id AS "unitId",e.status,e.revision,e.reason,e.support_amount::text AS "supportAmount",
  coalesce((SELECT jsonb_agg(jsonb_build_object('email',a.email,'share',m.share) ORDER BY a.email)
    FROM rms.extension_member m JOIN rms.account a ON (a.tenant_id,a.id)=(m.tenant_id,m.account_id)
    WHERE (m.tenant_id,m.entry_id)=(e.tenant_id,e.id)),'[]') AS members,
  coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'filename',f.filename,'code',f.evidence_type) ORDER BY f.created_at,f.id)
    FROM rms.attachment_intent f WHERE (f.tenant_id,f.extension_id)=(e.tenant_id,e.id) AND f.attached_at IS NOT NULL),'[]') AS files
  FROM rms.extension_entry e WHERE e.kind=$1 AND ($2='admin' OR e.owner_id=$3 OR $2='staff' AND e.unit_id=$4)`
const args=(a:SessionAccount,k:Kind)=>[k,a.userType,a.id,a.unitId]
export async function entry(db:PoolClient,a:SessionAccount,k:Kind,id:string,lock=false){
  const {rows:[item]}=await db.query<Item>(readable+" AND e.id=$5"+(lock?" FOR UPDATE OF e":""),[...args(a,k),id])
  if(!item)throw new NotFoundException()
  return item
}
export async function listEntries(db:PoolClient,a:SessionAccount,k:Kind,catalog:Rules):Promise<Page>{
  const result=await db.query<Item>(readable+" ORDER BY e.source_date DESC,e.title,e.id",args(a,k))
  const units=await db.query("SELECT id AS code,name AS label FROM rms.unit WHERE $1='admin' OR id=$2 ORDER BY name",[a.userType,a.unitId])
  return {items:result.rows,units:units.rows,catalog,actorId:a.id,canReview:a.userType==="admin"||a.userType==="staff",canCreate:a.userType!=="user"&&!!a.unitId}
}
export async function saveEntry(db:PoolClient,a:SessionAccount,k:Kind,id:string,cmd:Draft,r:Rules){
  if(!a.unitId||a.userType==="user")throw new ForbiddenException()
  if(!cmd||typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>500||!Number.isSafeInteger(cmd.revision)||cmd.revision<0||!r.types.some(t=>t.code===cmd.category)||
    typeof cmd.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(cmd.date)||!Number.isFinite(Date.parse(cmd.date))||new Date(cmd.date).toISOString().slice(0,10)!==cmd.date)
    throw new BadRequestException("Kiểm tra tên, ngày nguồn và loại đang áp dụng.")
  if(k==="upper-project"&&!r.bodies.some(b=>b.code===cmd.body))throw new BadRequestException("Chọn cơ quan quản lý cấp trên.")
  if(cmd.hostId!==null&&(a.userType!=="admin"&&a.unitId!==cmd.hostId||!(await db.query("SELECT 1 FROM rms.unit WHERE id::text=$1",[cmd.hostId])).rowCount))throw new BadRequestException("Đơn vị chủ trì ngoài phạm vi.")
  const values=[id,cmd.title.trim(),cmd.category,k==="upper-project"?cmd.body:"",cmd.hostId,cmd.date]
  if(cmd.revision){
    const prev=await entry(db,a,k,id,true)
    if(prev.ownerId!==a.id||prev.status!=="DRAFT"||prev.revision!==cmd.revision)throw new ConflictException("Bản nháp đã thay đổi hoặc đã gửi.")
    await db.query("UPDATE rms.extension_entry SET title=$2,category=$3,managing_body=$4,host_id=$5,source_date=$6,revision=revision+1 WHERE id=$1",values)
  }else{
    const inserted=await db.query("INSERT INTO rms.extension_entry(tenant_id,id,title,category,managing_body,host_id,source_date,owner_id,unit_id,kind) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING",[...values,a.id,a.unitId,k])
    if(!inserted.rowCount)throw new ConflictException("Mã đầu mục đã tồn tại.")
  }
  if(cmd.members!==undefined)await saveMembers(db,k,id,a.id,cmd.members)
  await appendAudit(db,a,k,id,"ENTRY_SAVED",{revision:cmd.revision+1})
  return entry(db,a,k,id)
}
async function saveMembers(db:PoolClient,kind:Kind,id:string,owner:string,members:NonNullable<Draft["members"]>){
  if(kind!=="upper-project"&&members?.length)throw new BadRequestException("Loại đầu mục không có bảng đóng góp.")
  const allocations=await resolveContributions(db,owner,members)
  await db.query("DELETE FROM rms.extension_member WHERE entry_id=$1",[id])
  await db.query(`INSERT INTO rms.extension_member(tenant_id,entry_id,account_id,share)
    SELECT rms.current_tenant(),$1,id,share FROM unnest($2::uuid[],$3::int[]) AS member(id,share)`,
    [id,allocations.map(m=>m.accountId),allocations.map(m=>m.share)])
}
export async function changeEntry(db:PoolClient,a:SessionAccount,k:Kind,id:string,cmd:Decision,r:Rules){
  const current=await entry(db,a,k,id,true)
  if(!cmd||!["submit","approve","return","reject","revoke"].includes(cmd.action)||typeof cmd.reason!=="string"||cmd.reason.length>2000)throw new BadRequestException()
  const submit=cmd.action==="submit",approve=cmd.action==="approve"
  if(submit?(a.id!==current.ownerId||a.userType==="user"):(a.id===current.ownerId||!(a.userType==="admin"||a.userType==="staff"&&a.unitId===current.unitId)))throw new ForbiddenException()
  const expected=submit?"DRAFT":cmd.action==="revoke"?"APPROVED":"PENDING"
  if(current.revision!==cmd.revision||current.status!==expected)throw new ConflictException("Đầu mục đã thay đổi.")
  const reason=cmd.reason.trim()
  if(cmd.action==="reject"&&k!=="activity")throw new BadRequestException("Quyết định từ chối chỉ áp dụng cho hoạt động khoa học.")
  if(!submit&&!approve&&!reason)throw new BadRequestException("Nhập lý do của quyết định.")
  let supportAmount:string|null=null
  if(cmd.supportAmount!==undefined){
    if(!approve||k!=="activity")throw new BadRequestException("Kinh phí hỗ trợ được ghi khi phê duyệt hoạt động khoa học.")
    const amount=money(cmd.supportAmount,true)
    if(amount>0n)supportAmount=amount.toString()
  }
  if(submit||approve){
    const type=r.types.find(t=>t.code===current.category)
    if(!type)throw new ConflictException("Loại của đầu mục đã ngừng áp dụng.")
    if(approve||k==="activity"){
      const missing=type.required.filter(code=>!current.files.some(f=>f.code===code))
      if(missing.length)throw new ConflictException("Thiếu minh chứng: "+missing.map(code=>r.evidence.find(e=>e.code===code)?.label+" ("+code+")").join(", "))
    }
  }
  const states={submit:"PENDING",approve:"APPROVED",return:"DRAFT",reject:"REJECTED",revoke:"DRAFT"} as const
  const events={submit:"ENTRY_SUBMITTED",approve:"ENTRY_APPROVED",return:"ENTRY_RETURNED",reject:"ENTRY_REJECTED",revoke:"ENTRY_REVOKED"} as const
  const status=states[cmd.action]
  await db.query("UPDATE rms.extension_entry SET status=$2,reason=$3,support_amount=$4,revision=revision+1 WHERE id=$1",[id,status,reason,supportAmount])
  if(cmd.action==="revoke")await revokeSourceHours(db,a,k,id,current.revision,reason)
  await appendAudit(db,a,k,id,events[cmd.action],{from:current.status,to:status,revision:cmd.revision+1,category:current.category,reason,
    ...(k==="activity"?{fromSupportAmount:current.supportAmount,toSupportAmount:supportAmount}:{})})
  return entry(db,a,k,id)
}

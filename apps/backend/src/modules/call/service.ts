import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../iam/account.js"
import { appendAudit } from "../audit/append.js"
import { offset } from "../proposal/access.js"

type Input=operations["saveNewCall"]["requestBody"]["content"]["application/json"]
type Row=operations["getCall"]["responses"][200]["content"]["application/json"]
type Change=operations["changeCallStatus"]["requestBody"]["content"]["application/json"]
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const canManage=(a:SessionAccount)=>["staff","admin"].includes(a.userType)&&a.permissions.includes("research.proposals")
function requireManager(a:SessionAccount){if(!canManage(a))throw new ForbiddenException()}
function validDate(s:unknown):s is string{
  if(typeof s!=="string" || !/^\d{4}-\d\d-\d\d$/.test(s))return false
  const d=new Date(s+"T00:00:00Z")
  return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s
}
const cols=`c.id,c.code,c.name,c.start_date::text AS "startDate",c.end_date::text AS "endDate",c.status,c.revision,
  c.template_id AS "templateId",c.criteria_id AS "criteriaId",
  coalesce(c.source_snapshot->'form'->>'name',f.name) AS "templateName",
  coalesce(c.source_snapshot->'form'->'definition'->'fields','[]'::jsonb) AS "formFields",
  coalesce((SELECT jsonb_agg(jsonb_build_object('id',x->>'id','name',x->>'name')) FROM jsonb_array_elements(c.source_snapshot->'fields') x),'[]'::jsonb) AS "fieldOptions",
  ARRAY(SELECT x.field_id FROM rms.call_field x WHERE (x.tenant_id,x.call_id)=(c.tenant_id,c.id) ORDER BY x.field_id) AS "fieldIds",
  rms.receiving(c.status,c.start_date,c.end_date,$1) AS receiving`
const source=" FROM rms.proposal_call c LEFT JOIN rms.intake_reference f ON (c.tenant_id,c.template_id)=(f.tenant_id,f.id)"
export async function listCalls(db:PoolClient,actor:SessionAccount,q:Record<string,unknown>,now=new Date()) {
  const manager=canManage(actor),group=q.group??"receiving"
  if(!["all","receiving"].includes(String(group)) || (q.search!==undefined && (typeof q.search!=="string" || q.search.length>240)))throw new BadRequestException()
  const where=` WHERE ($2::boolean OR (c.status='OPEN' AND $3::boolean))
    AND ($4::boolean OR rms.receiving(c.status,c.start_date,c.end_date,$1))
    AND (strpos(lower(c.code),lower($5))>0 OR strpos(lower(c.name),lower($5))>0)`
  const values=[now,manager,actor.userType==="author"||actor.userType==="user",group==="all",q.search??""]
  const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total"+source+where,values)
  const {rows:items}=await db.query<Row>("SELECT "+cols+source+where+" ORDER BY c.end_date DESC,c.id LIMIT 20 OFFSET $6",[...values,offset(q.skip)])
  return {items,total,canManage:manager}
}
export async function getCall(db:PoolClient,actor:SessionAccount,id:string,now=new Date()) {
  const {rows:[row]}=await db.query<Row>("SELECT "+cols+source+" WHERE c.id=$2 AND ($3::boolean OR c.status='OPEN')",[now,id,canManage(actor)])
  if(!row)throw new NotFoundException()
  return row
}
export async function references(db:PoolClient,actor:SessionAccount){
  requireManager(actor)
  return (await db.query("SELECT id,kind,name,revision FROM rms.intake_reference WHERE active ORDER BY kind,name,revision DESC")).rows
}
async function selected(db:PoolClient,input:Input,opening:boolean){
  const wanted=[
    ...input.fieldIds.map(id=>({id,kind:"field",label:"Lĩnh vực"})),
    {id:input.templateId,kind:"form",label:"Biểu mẫu"},{id:input.criteriaId,kind:"criteria",label:"Bộ tiêu chí"},
  ].filter(x=>x.id)
  const ids=wanted.map(x=>x.id)
  const {rows}=await db.query("SELECT id,kind,name,revision,active,definition FROM rms.intake_reference WHERE id=ANY($1::uuid[]) ORDER BY id FOR SHARE",[ids])
  for(const w of wanted){
    const record=rows.find(r=>r.id===w.id && r.kind===w.kind)
    if(!record)throw new BadRequestException(w.label+" không hợp lệ.")
    if(opening && !record.active)throw new ConflictException(w.label+" đã hết hiệu lực: "+record.name)
  }
  return {fields:rows.filter(r=>r.kind==="field"),form:rows.find(r=>r.kind==="form"),criteria:rows.find(r=>r.kind==="criteria")}
}
export async function saveCall(db:PoolClient,actor:SessionAccount,input:Input,id?:string,now=new Date()) {
  requireManager(actor)
  if(!input || typeof input.name!=="string" || !input.name.trim() || input.name.length>240 ||
     typeof input.code!=="string" || !/^[a-z0-9._-]{1,64}$/i.test(input.code) ||
     !validDate(input.startDate)||!validDate(input.endDate)||input.startDate>input.endDate ||
     !Array.isArray(input.fieldIds)||input.fieldIds.length>100||new Set(input.fieldIds).size!==input.fieldIds.length ||
     input.fieldIds.some(x=>typeof x!=="string"||!uuid.test(x)) ||
     [input.templateId,input.criteriaId].some(x=>x!==null && (typeof x!=="string"||!uuid.test(x))))throw new BadRequestException("Kiểm tra mã, tên, khoảng ngày và danh mục của kỳ.")
  let opened=false
  if(id){
    const {rows:[locked]}=await db.query("SELECT revision,status FROM rms.proposal_call WHERE id=$1 FOR UPDATE",[id])
    if(!locked)throw new NotFoundException()
    if(locked.revision!==input.revision || !["DRAFT","OPEN"].includes(locked.status))throw new ConflictException("Trạng thái kỳ đã thay đổi.")
    opened=locked.status==="OPEN"
    if(opened){
      const submitted=await db.query("SELECT 1 FROM rms.research_project WHERE call_id=$1 AND submitted_at IS NOT NULL LIMIT 1",[id])
      if(submitted.rowCount)throw new ConflictException("Kỳ đã nhận đề xuất. Chỉ cho phép gia hạn.")
      if(!input.fieldIds.length||!input.templateId||!input.criteriaId)throw new BadRequestException("Cần đủ cấu hình khi sửa kỳ đang mở.")
    }
  }
  const snapshot=await selected(db,input,opened)
  const values=[input.code,input.name.trim(),input.startDate,input.endDate,input.templateId,input.criteriaId]
  let key:string
  try {
    const op=id?db.query("UPDATE rms.proposal_call SET code=$1,name=$2,start_date=$3,end_date=$4,template_id=$5,criteria_id=$6,source_snapshot=coalesce($8,source_snapshot),revision=revision+1 WHERE id=$7 RETURNING id",[...values,id,opened?snapshot:null]):
      db.query("INSERT INTO rms.proposal_call(tenant_id,code,name,start_date,end_date,template_id,criteria_id) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6) RETURNING id",values)
    key=(await op).rows[0].id
  }catch(e){if((e as {code?:string}).code==="23505")throw new ConflictException("Mã kỳ đã được sử dụng.");throw e}
  if(id)await db.query("DELETE FROM rms.call_field WHERE call_id=$1",[id])
  await db.query("INSERT INTO rms.call_field(tenant_id,call_id,field_id) SELECT rms.current_tenant(),$1,x FROM unnest($2::uuid[]) x",[key,input.fieldIds])
  await appendAudit(db,actor,"call",key,id?"CALL_UPDATED":"CALL_CREATED")
  return getCall(db,actor,key,now)
}
export async function changeCall(db:PoolClient,actor:SessionAccount,id:string,change:Change,now=new Date()){
  requireManager(actor)
  if(!change || !["open","close","cancel","extend"].includes(change.action) || !Number.isSafeInteger(change.revision))throw new BadRequestException()
  const {rows:[lock]}=await db.query("SELECT revision,($2::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS today FROM rms.proposal_call WHERE id=$1 FOR UPDATE",[id,now])
  if(!lock)throw new NotFoundException()
  if(lock.revision!==change.revision)throw new ConflictException("Kỳ đã thay đổi. Hãy tải lại.")
  const row=await getCall(db,actor,id,now)
  let end=row.endDate,snapshot
  const action=change.action
  if(action==="open"){
    if(row.status!=="DRAFT" || row.endDate<lock.today)throw new ConflictException("Chỉ mở được kỳ nháp còn hạn.")
    if(!row.fieldIds.length||!row.templateId||!row.criteriaId)throw new ConflictException("Cần lĩnh vực, biểu mẫu và bộ tiêu chí.")
    snapshot=await selected(db,row,true)
  }else if(action==="close"){
    if(row.status!=="OPEN")throw new ConflictException("Kỳ chưa mở.")
  }else if(action==="cancel"){
    if(!["OPEN","DRAFT"].includes(row.status))throw new ConflictException("Trạng thái kỳ không cho phép hủy.")
    const used=await db.query("SELECT 1 FROM rms.research_project WHERE call_id=$1 AND submitted_at IS NOT NULL LIMIT 1",[id])
    if(used.rowCount)throw new ConflictException("Kỳ đã tiếp nhận đề xuất. Vui lòng đóng kỳ.")
  }else{
    if(!["OPEN","CLOSED"].includes(row.status)||!validDate(change.endDate)||change.endDate<=row.endDate||change.endDate<=lock.today)throw new BadRequestException("Hạn gia hạn phải ở tương lai và sau hạn hiện hành.")
    end=change.endDate
  }
  const next={open:"OPEN",close:"CLOSED",cancel:"CANCELLED",extend:"OPEN"}[action]
  const needsReason=action==="cancel"||action==="extend"&&row.status==="CLOSED"
  if(change.reason!==undefined&&(typeof change.reason!=="string"||change.reason.length>2000))throw new BadRequestException("Lý do tối đa 2.000 ký tự.")
  const reason=change.reason?.trim()
  if(needsReason&&!reason)throw new BadRequestException("Nhập lý do hủy kỳ hoặc mở lại kỳ đã đóng.")
  await db.query("UPDATE rms.proposal_call SET status=$2,end_date=$3,source_snapshot=coalesce($4,source_snapshot),revision=revision+1 WHERE id=$1",[id,next,end,snapshot??null])
  await appendAudit(db,actor,"call",id,"CALL_"+{open:"OPENED",close:"CLOSED",cancel:"CANCELLED",extend:"EXTENDED"}[action],{from:row.status,to:next,oldEnd:row.endDate,end,...(reason?{reason}:{})})
  return getCall(db,actor,id,now)
}

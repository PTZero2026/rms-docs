import {enqueueProductHours,productCredits} from "./teaching-credit.js"
import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import {appendAudit} from "../audit/append.js"
import type {SessionAccount} from "../iam/account.js"
import {notifyRecipients,unitOfficers} from "../notification/emit.js"
import {checkDuplicate,norm,validateDraft,validatePublication} from "./service.js"

type Page=operations["listIndependentProducts"]["responses"][200]["content"]["application/json"]
type Item=Page["items"][number]
type Body<K extends "saveIndependentProduct"|"submitIndependentProduct"|"decideIndependentProduct">=operations[K]["requestBody"]["content"]["application/json"]
const params=(actor:SessionAccount)=>[actor.id,actor.userType,actor.unitId]
const manager="($2='admin' OR ($2='staff' AND o.unit_id=$3))"
const participant="($1=o.owner_id OR $1=ANY(o.authors))"
const declarer="($1=o.declared_by AND "+manager+")"
const select=`SELECT o.id,o.unit_id AS "unitId",o.owner_id AS "ownerId",o.title,o.kind,o.publication_year AS year,
  o.publication,o.authors,o.files,o.revision,o.status,o.reason,
  ARRAY(SELECT coalesce(nullif(p.full_name,''),p.email) FROM unnest(o.authors) WITH ORDINALITY ids(id,n)
    JOIN rms.account p ON (p.tenant_id,p.id)=(o.tenant_id,ids.id) ORDER BY ids.n) AS "authorLabels",
  ((${participant} AND $2='author') OR ${declarer}) AS "canEdit",
  (${manager} AND NOT ${participant} AND o.declared_by IS DISTINCT FROM $1) AS "canReview",
  (SELECT coalesce(jsonb_agg(jsonb_build_object('id',f.id,'label',f.filename) ORDER BY f.filename,f.id),'[]'::jsonb)
     FROM rms.attachment_intent f WHERE (f.tenant_id,f.output_id)=(o.tenant_id,o.id) AND f.attached_at IS NOT NULL
     AND (f.id=ANY(o.files) OR (o.status IN ('DRAFT','REJECTED') AND (${participant} OR ${declarer})))) AS attachments
  FROM rms.research_output o WHERE o.project_id IS NULL AND (${manager} OR ${participant})`

export async function independentRecord(db:PoolClient,a:SessionAccount,id:string,lock=false){
  const {rows:[row]}=await db.query<Item>(select+" AND o.id=$4"+(lock?" FOR UPDATE OF o":""),[...params(a),id])
  if(!row)throw new NotFoundException()
  return row
}
function canDeclare(a:SessionAccount){return a.userType==="admin"||!!a.unitId&&["staff","author"].includes(a.userType)}
export async function findIndependentAuthor(db:PoolClient,a:SessionAccount,email:unknown){
  if(!canDeclare(a))throw new ForbiddenException()
  if(typeof email!=="string"||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))throw new BadRequestException("Nhập đầy đủ email của đồng tác giả.")
  const {rows:[person]}=await db.query<{id:string;label:string}>(`SELECT id,coalesce(nullif(full_name,''),email) AS label FROM rms.account
    WHERE email=$1 AND is_active AND deleted_at IS NULL AND unit_id IS NOT NULL`,[email.trim().toLowerCase()])
  if(!person)throw new NotFoundException("Chưa tìm thấy tác giả trong danh bạ của trường.")
  return person
}
export async function independentPage(db:PoolClient,a:SessionAccount):Promise<Page>{
  const canCreate=canDeclare(a)
  const authors=canCreate?(await db.query<Page["authors"][number]>(`SELECT id,coalesce(nullif(full_name,''),email) AS label FROM rms.account
    WHERE unit_id IS NOT NULL AND ($1='admin' OR unit_id=$2) AND is_active AND deleted_at IS NULL ORDER BY label,id`,[a.userType,a.unitId])).rows:[]
  const items=(await db.query<Item>(select+" ORDER BY o.title,o.id",params(a))).rows
  return {actorId:a.id,defaultAuthorId:a.userType==="author"?a.id:null,canCreate,authors,items}
}
async function usable(db:PoolClient,id:string,files:string[]){
  const found=await db.query("SELECT id FROM rms.attachment_intent WHERE output_id=$1 AND attached_at IS NOT NULL AND id=ANY($2::uuid[]) FOR SHARE",[id,files])
  if(found.rowCount!==files.length)throw new BadRequestException("Chọn minh chứng đã tải cho chính sản phẩm này.")
}
export async function saveIndependent(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"saveIndependentProduct">){
  validateDraft(cmd)
  const prior=cmd.revision?await independentRecord(db,a,id,true):undefined
  if(prior){
    if(!prior.canEdit)throw new ForbiddenException()
    if(!["DRAFT","REJECTED"].includes(prior.status)||prior.revision!==cmd.revision)throw new ConflictException("Bản kê khai đã khóa hoặc thay đổi.")
  }else if(!["author","staff","admin"].includes(a.userType))throw new ForbiddenException()
  const owner=prior?.ownerId??(a.userType==="author"?a.id:cmd.authors[0])
  if(!owner||!cmd.authors.includes(owner))throw new BadRequestException("Chọn tác giả đứng tên cho bản kê khai độc lập.")
  const people=await db.query<{id:string;unit_id:string}>(`SELECT id,unit_id FROM rms.account WHERE id=ANY($1::uuid[]) AND unit_id IS NOT NULL
    AND is_active AND deleted_at IS NULL ORDER BY id FOR SHARE`,[cmd.authors])
  const unit=prior?.unitId??people.rows.find(person=>person.id===owner)?.unit_id
  if(!unit||people.rowCount!==cmd.authors.length)
    throw new BadRequestException("Chọn tác giả có tài khoản đang hoạt động trong trường.")
  if(!prior&&a.userType!=="admin"&&unit!==a.unitId)throw new ForbiddenException()
  await usable(db,id,cmd.files)
  const values=[id,cmd.title.trim(),norm(cmd.title),cmd.kind,cmd.year,cmd.publication.trim(),cmd.authors,cmd.files]
  if(prior)await db.query(`UPDATE rms.research_output SET title=$2,normalized_title=$3,kind=$4,publication_year=$5,
    publication=$6,authors=$7,files=$8,revision=revision+1,status='DRAFT' WHERE id=$1 AND project_id IS NULL`,values)
  else{
    const saved=await db.query(`INSERT INTO rms.research_output(tenant_id,id,title,normalized_title,kind,publication_year,publication,authors,files,owner_id,unit_id,declared_by)
      VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,[...values,owner,unit,a.id])
    if(!saved.rowCount)throw new ConflictException("Mã sản phẩm đã được dùng.")
  }
  await appendAudit(db,a,"product",id,"PRODUCT_DRAFT_SAVED",{projectId:null,files:cmd.files,previousFiles:prior?.files??[],from:prior?.status??null,to:"DRAFT",revision:cmd.revision+1})
  return independentRecord(db,a,id)
}
export async function submitIndependent(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"submitIndependentProduct">,types:string[]){
  const row=await independentRecord(db,a,id,true)
  if(!row.canEdit)throw new ForbiddenException()
  if(row.status!=="DRAFT"||row.revision!==cmd?.revision)throw new ConflictException("Bản kê khai đã thay đổi.")
  validatePublication(row,types,new Date())
  await usable(db,id,row.files)
  await checkDuplicate(db,null,row,cmd.distinct===true)
  await db.query("UPDATE rms.research_output SET status='PENDING_APPROVAL',revision=revision+1 WHERE id=$1",[id])
  const audit=await appendAudit(db,a,"product",id,"PRODUCT_SUBMITTED",{projectId:null,from:row.status,to:"PENDING_APPROVAL",revision:row.revision+1,distinct:cmd.distinct})
  await notifyRecipients(db,"RESEARCH_OUTPUT_SUBMITTED",id,audit,await unitOfficers(db,row.unitId),{productId:id})
  return independentRecord(db,a,id)
}
export async function decideIndependent(db:PoolClient,a:SessionAccount,id:string,cmd:Body<"decideIndependentProduct">,hoursEnabled=false){
  const row=await independentRecord(db,a,id,true)
  if(!row.canReview)throw new ForbiddenException()
  if(!cmd||!["approve","reject","reopen"].includes(cmd.action)||typeof cmd.reason!=="string"||cmd.reason.length>2000||
    cmd.action!=="approve"&&!cmd.reason.trim())throw new BadRequestException("Nhập lý do từ chối hoặc mở lại.")
  if(cmd.action==="approve"&&row.status==="APPROVED"&&row.revision===cmd.revision+1)return row
  if(row.revision!==cmd.revision||row.status!==(cmd.action==="reopen"?"APPROVED":"PENDING_APPROVAL"))throw new ConflictException("Bản kê khai đã thay đổi.")
  if(cmd.action==="approve")await usable(db,id,row.files)
  const credits=await productCredits(db,a,row,cmd,hoursEnabled)
  const status=cmd.action==="approve"?"APPROVED":cmd.action==="reject"?"REJECTED":"DRAFT"
  await db.query("UPDATE rms.research_output SET status=$2,reason=$3,reviewed_by=$4,reviewed_at=now(),approved_hour_shares=$5::jsonb,revision=revision+1 WHERE id=$1",[id,status,cmd.reason.trim(),a.id,credits?JSON.stringify(credits):null])
  if(credits)await enqueueProductHours(db,id)
  const audit=await appendAudit(db,a,"product",id,cmd.action==="reopen"?"PRODUCT_REOPENED":"PRODUCT_"+status,{projectId:null,from:row.status,to:status,reason:cmd.reason.trim(),revision:row.revision+1,credits})
  await notifyRecipients(db,"RESEARCH_OUTPUT_"+status,id,audit,row.authors,{productId:id})
  return independentRecord(db,a,id)
}

import {enqueueProductHours,productCredits} from "./teaching-credit.js"
import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { projectAccess } from "../proposal/access.js"
import { appendAudit } from "../audit/append.js"
import { notifyRecipients,unitOfficers } from "../notification/emit.js"
import type { SessionAccount } from "../iam/account.js"

type Page=operations["listProjectProducts"]["responses"][200]["content"]["application/json"]
type Output=Page["items"][number]
type Op="saveProduct"|"submitProduct"|"decideProduct"|"revokeProductEvidence"
type Input<K extends Op>=operations[K]["requestBody"]["content"]["application/json"]
const fields='id,owner_id AS "ownerId",title,kind,publication_year AS year,publication,authors,files,revision,status,reason'
const uuid=/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
const uniqueIds=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=100&&v.every(id=>typeof id==="string"&&uuid.test(id))&&new Set(v).size===v.length
export const norm=(s:string)=>s.normalize("NFC").trim().replace(/\s+/g," ").toLocaleLowerCase("vi")
const canReview=(a:SessionAccount)=>a.userType==="staff"||a.userType==="admin"
const usableFiles=`SELECT i.id,i.filename AS label FROM rms.attachment_intent i WHERE i.project_id=$1 AND i.attached_at IS NOT NULL
  AND NOT EXISTS(SELECT 1 FROM rms.product_evidence_revocation x WHERE (x.tenant_id,x.project_id,x.file_id)=(i.tenant_id,i.project_id,i.id))`
async function members(db:PoolClient,id:string){
  return (await db.query<{id:string;label:string}>(`SELECT a.id,a.email AS label FROM rms.account a JOIN rms.research_project p ON p.tenant_id=a.tenant_id
    WHERE p.id=$1 AND a.is_active AND a.deleted_at IS NULL AND (a.unit_id=p.unit_id OR a.id=p.owner_id OR EXISTS
    (SELECT 1 FROM rms.project_member m WHERE (m.tenant_id,m.project_id,m.account_id)=(p.tenant_id,p.id,a.id))) ORDER BY a.email`,[id])).rows
}
export async function productCommitments(db:PoolClient,id:string):Promise<Page["commitments"]>{
  const {rows}=await db.query(`SELECT c.key AS kind,c.value::int AS required,count(o.id)::int AS approved,greatest(0,c.value::int-count(o.id))::int AS missing
    FROM rms.project_assignment a CROSS JOIN LATERAL jsonb_each_text(a.commitments) c
    LEFT JOIN rms.research_output o ON (o.tenant_id,o.project_id,o.kind)=(a.tenant_id,a.project_id,c.key) AND o.status='APPROVED'
    WHERE a.project_id=$1 GROUP BY c.key,c.value ORDER BY c.key`,[id])
  return rows as Page["commitments"]
}
export async function listProducts(db:PoolClient,a:SessionAccount,id:string):Promise<Page>{
  const p=await projectAccess(db,a,id)
  const officer=a.userType==="admin"||(a.userType==="staff"&&a.unitId===p.unit_id)
  const principal=p.owner_id===a.id
  const {rows:items}=await db.query<Output>("SELECT "+fields+" FROM rms.research_output WHERE project_id=$1 AND ($2 OR owner_id=$3 OR $3=ANY(authors)) ORDER BY title,id",[id,officer||principal,a.id])
  return {id,title:p.title,status:p.status_semantic,revision:p.row_version,canReview:officer,principal,items,
    authors:await members(db,id),files:(await db.query(usableFiles+" ORDER BY i.filename,i.id",[id])).rows,commitments:await productCommitments(db,id)}
}
async function item(db:PoolClient,project:string,id:string){
  const {rows:[out]}=await db.query<Output>("SELECT "+fields+" FROM rms.research_output WHERE project_id=$1 AND id=$2 FOR UPDATE",[project,id])
  if(!out)throw new NotFoundException()
  return out
}
function editable(status:string){if(["COMPLETED","CANCELLED","REJECTED"].includes(status))throw new ConflictException("Đề tài đã đóng.")}
function writer(a:SessionAccount,owner:string,authors:string[],project:{unit_id:string;owner_id:string}){
  if(owner!==a.id&&!authors.includes(a.id)&&project.owner_id!==a.id&&!(canReview(a)&&(a.userType==="admin"||a.unitId===project.unit_id)))throw new ForbiddenException()
}
async function evidence(db:PoolClient,project:string,ids:string[]){
  const r=await db.query(usableFiles+" AND i.id=ANY($2::uuid[]) FOR SHARE OF i",[project,ids])
  if(r.rowCount!==ids.length)throw new BadRequestException("Minh chứng thiếu hoặc đã hết quyền sử dụng.")
}
export function validateDraft(cmd:Input<"saveProduct">){
  if(!cmd||typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>500||typeof cmd.kind!=="string"||
    cmd.kind.length>64||!uniqueIds(cmd.authors)||!uniqueIds(cmd.files)||typeof cmd.publication!=="string"||cmd.publication.length>4000||
    !(cmd.year===null||(Number.isInteger(cmd.year)&&cmd.year>=1&&cmd.year<=9999))||!Number.isSafeInteger(cmd.revision)||cmd.revision<0)throw new BadRequestException("Kiểm tra tên, loại, năm và tác giả của sản phẩm.")
}
export function validatePublication(o:Output,types:string[],now:Date,firstYear=1900){
  const year=new Date(now.getTime()+7*3600000).getUTCFullYear()
  if(!types.includes(o.kind))throw new BadRequestException("Loại sản phẩm đã ngừng dùng. Mở bản kê khai và chọn loại đang áp dụng.")
  if(!o.year||o.year>year||o.year<firstYear||!o.publication.trim()||!o.authors.length||!o.files.length)
    throw new BadRequestException("Cần năm hợp lệ, tác giả, thông tin công bố và minh chứng.")
}
export async function checkDuplicate(db:PoolClient,project:string|null,o:Output,distinct:boolean){
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text||$1,0))",[norm(o.title)+"/"+o.year])
  const same=await db.query("SELECT project_id=$1 AND kind=$5 AS exact,authors && $6::uuid[] AS common FROM rms.research_output WHERE id<>$2 AND normalized_title=$3 AND publication_year=$4 AND status IN ('PENDING_APPROVAL','APPROVED')",[project,o.id,norm(o.title),o.year,o.kind,o.authors])
  if(same.rows.some(x=>x.exact)||same.rows.some(x=>x.common)&&distinct!==true)throw new ConflictException("Có sản phẩm trùng thông tin. Kiểm tra tên, loại, năm và tác giả.")
}
export async function saveProduct(db:PoolClient,a:SessionAccount,project:string,id:string,cmd:Input<"saveProduct">){
  const p=await projectAccess(db,a,project,true);editable(p.status_semantic)
  validateDraft(cmd)
  const prior=cmd.revision?await item(db,project,id):null
  if(prior){
    writer(a,prior.ownerId,prior.authors,p)
    if(!["DRAFT","REJECTED"].includes(prior.status)||prior.revision!==cmd.revision)throw new ConflictException("Sản phẩm đã khóa hoặc đã thay đổi.")
  }
  if(!canReview(a)&&a.id!==p.owner_id&&!cmd.authors.includes(a.id))throw new ForbiddenException()
  const allowed=await members(db,project)
  if(cmd.authors.some(id=>!allowed.some(a=>a.id===id)))throw new BadRequestException("Tác giả ngoài phạm vi.")
  await evidence(db,project,cmd.files)
  const values=[project,id,cmd.title.trim(),norm(cmd.title),cmd.kind,cmd.year,cmd.publication.trim(),cmd.authors,cmd.files]
  if(prior)await db.query("UPDATE rms.research_output SET title=$3,normalized_title=$4,kind=$5,publication_year=$6,publication=$7,authors=$8,files=$9,revision=revision+1,status='DRAFT' WHERE project_id=$1 AND id=$2",values)
  else{
    const insert=await db.query("INSERT INTO rms.research_output(tenant_id,project_id,id,title,normalized_title,kind,publication_year,publication,authors,files,unit_id,owner_id) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING",[...values,p.unit_id,a.id])
    if(!insert.rowCount)throw new ConflictException("Mã sản phẩm đã được dùng.")
  }
  await appendAudit(db,a,"project",project,"PRODUCT_DRAFT_SAVED",{id,files:cmd.files,previousFiles:prior?.files??[],previousStatus:prior?.status,revision:cmd.revision+1})
  return listProducts(db,a,project)
}
export async function submitProduct(db:PoolClient,a:SessionAccount,project:string,id:string,cmd:Input<"submitProduct">,types:string[],now=new Date()){
  const p=await projectAccess(db,a,project,true);editable(p.status_semantic)
  const o=await item(db,project,id);writer(a,o.ownerId,o.authors,p)
  if(o.status!=="DRAFT"||o.revision!==cmd?.revision)throw new ConflictException("Bản kê khai đã thay đổi.")
  const {rows:[assignment]}=await db.query("SELECT extract(year FROM starts)::int AS first FROM rms.project_assignment WHERE project_id=$1",[project])
  validatePublication(o,types,now,assignment?.first??1900)
  await evidence(db,project,o.files)
  await checkDuplicate(db,project,o,cmd.distinct)
  await db.query("UPDATE rms.research_output SET status='PENDING_APPROVAL',revision=revision+1 WHERE id=$1",[id])
  const audit=await appendAudit(db,a,"project",project,"PRODUCT_SUBMITTED",{id,distinct:cmd.distinct})
  await notifyRecipients(db,"RESEARCH_OUTPUT_SUBMITTED",project,audit,await unitOfficers(db,p.unit_id),{productId:id})
  return listProducts(db,a,project)
}
export async function decideProduct(db:PoolClient,a:SessionAccount,project:string,id:string,cmd:Input<"decideProduct">,hoursEnabled=false){
  if(!canReview(a))throw new ForbiddenException()
  const p=await projectAccess(db,a,project,true);editable(p.status_semantic)
  if(a.userType==="staff"&&a.unitId!==p.unit_id)throw new ForbiddenException()
  const o=await item(db,project,id)
  if(a.id===p.owner_id||a.id===o.ownerId||o.authors.includes(a.id))throw new ForbiddenException()
  if(!cmd||!["approve","reject","reopen"].includes(cmd.action)||typeof cmd.reason!=="string"||cmd.reason.length>2000||cmd.action!=="approve"&&!cmd.reason.trim())throw new BadRequestException("Cần lý do từ chối hoặc mở lại.")
  if(o.status==="APPROVED"&&cmd.action==="approve"&&o.revision===cmd.revision+1)return listProducts(db,a,project)
  if(o.status!==(cmd.action==="reopen"?"APPROVED":"PENDING_APPROVAL")||cmd.revision!==o.revision)throw new ConflictException("Sản phẩm đã thay đổi.")
  if(cmd.action==="reopen"&&p.status_semantic!=="IN_PROGRESS")throw new ConflictException("Đề tài đã qua bước thực hiện.")
  if(cmd.action==="approve")await evidence(db,project,o.files)
  const credits=await productCredits(db,a,o,cmd,hoursEnabled)
  const status=cmd.action==="approve"?"APPROVED":cmd.action==="reject"?"REJECTED":"DRAFT"
  await db.query("UPDATE rms.research_output SET status=$2,reason=$3,reviewed_by=$4,reviewed_at=now(),approved_hour_shares=$5::jsonb,revision=revision+1 WHERE id=$1",[id,status,cmd.reason.trim(),a.id,credits?JSON.stringify(credits):null])
  if(credits)await enqueueProductHours(db,id)
  const audit=await appendAudit(db,a,"project",project,"PRODUCT_"+(cmd.action==="reopen"?"REOPENED":status),{id,reason:cmd.reason,revision:o.revision+1,credits})
  await notifyRecipients(db,"RESEARCH_OUTPUT_"+status,project,audit,[p.owner_id,o.ownerId],{productId:id})
  return listProducts(db,a,project)
}
export async function revokeProductEvidence(db:PoolClient,a:SessionAccount,project:string,id:string,cmd:Input<"revokeProductEvidence">){
  const p=await projectAccess(db,a,project,true)
  const {rows:[f]}=await db.query("SELECT uploader_id FROM rms.attachment_intent WHERE project_id=$1 AND id=$2 AND attached_at IS NOT NULL",[project,id])
  if(!f)throw new NotFoundException()
  if(f.uploader_id!==a.id&&!(a.userType==="admin"||a.userType==="staff"&&a.unitId===p.unit_id))throw new ForbiddenException()
  if(typeof cmd?.reason!=="string"||!cmd.reason.trim()||cmd.reason.length>2000)throw new BadRequestException("Cần lý do thu quyền sử dụng.")
  const r=await db.query("INSERT INTO rms.product_evidence_revocation VALUES(rms.current_tenant(),$1,$2,$3,$4,now()) ON CONFLICT DO NOTHING",[project,id,a.id,cmd.reason.trim()])
  if(r.rowCount)await appendAudit(db,a,"project",project,"PRODUCT_EVIDENCE_REVOKED",{fileId:id,reason:cmd.reason})
  return listProducts(db,a,project)
}

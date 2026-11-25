import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../iam/account.js"
import {validateUpload} from "../attachments/service.js"
import type {AttachmentStore} from "../attachments/store.js"
import {appendAudit} from "../audit/append.js"
import {entry,type Kind,type Rules} from "./entries.js"
import {appliedRecord} from "../applied-project/register-applied-project/service.js"
import {studentRecord} from "../student-project/confirm-mentor/service.js"
import {independentRecord} from "../product/independent.js"
type FileKind=Kind|"applied-project"|"student-project"|"product"
async function fileRecord(db:PoolClient,a:SessionAccount,k:FileKind,id:string,lock=false){
  if(k==="product"){
    const record=await independentRecord(db,a,id,lock)
    return {...record,files:record.attachments.map(f=>({id:f.id,filename:f.label,code:"OUTPUT"}))}
  }
  if(k==="student-project"){
    const row=await studentRecord(db,a,id,lock)
    return {...row,ownerId:row.leader}
  }
  return k==="applied-project"?appliedRecord(db,a,id,lock):entry(db,a,k,id,lock)
}
const sourceColumn=(k:FileKind)=>k==="applied-project"?"applied_id":k==="student-project"?"student_id":k==="product"?"output_id":"extension_id"
export type Upload=operations["createEntryFileIntent"]["requestBody"]["content"]["application/json"]
async function writable(db:PoolClient,a:SessionAccount,k:FileKind,id:string){
  const record=await fileRecord(db,a,k,id,true)
  if("canEdit" in record){
    if(!record.canEdit)throw new ForbiddenException()
    if(record.status!=="DRAFT")throw new ConflictException("Bản kê khai đã khóa minh chứng.")
    return record
  }
  if("finalRound" in record){
    if(a.id!==record.leader)throw new ForbiddenException()
    if(record.status!=="IN_PROGRESS")throw new ConflictException("Bộ minh chứng của lượt này đã khóa.")
    return record
  }
  if(a.id!==record.ownerId||a.userType==="user")throw new ForbiddenException()
  if("resultStatus" in record&&record.status==="APPROVED"&&record.resultStatus==="DRAFT")return record
  if(record.status!=="DRAFT")throw new ConflictException("Cần trả đầu mục về Nháp trước khi sửa minh chứng.")
  return record
}
export async function issue(db:PoolClient,a:SessionAccount,k:FileKind,id:string,cmd:Upload,r:Rules,store:AttachmentStore,tenant:string){
  const current=await writable(db,a,k,id)
  validateUpload(cmd)
  const allowed=k==="product"?[{code:"OUTPUT"}]:"finalEvidence" in current?current.finalEvidence:r.evidence
  if(!allowed.some(e=>e.code===cmd.evidenceType))throw new BadRequestException("Loại minh chứng ngoài danh mục.")
  const cycle="approvalRevision" in current?current.approvalRevision:null
  if(cmd.resourceVersion!==current.revision)throw new ConflictException("Hồ sơ đã thay đổi.")
  const {rows:[file]}=await db.query(`INSERT INTO rms.attachment_intent(tenant_id,${sourceColumn(k)},evidence_type,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,applied_cycle,student_round)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,now()+interval '5 minutes',$9,$10) RETURNING id`,[id,cmd.evidenceType,current.revision,a.id,cmd.filename,cmd.mime,cmd.size,cmd.sha256,cycle,"finalRound" in current?current.finalRound:null])
  return {id:file.id,...await store.form(tenant,file.id,cmd.mime,cmd.size)}
}
export async function finalizeEntry(db:PoolClient,a:SessionAccount,k:FileKind,id:string,fileId:string,store:AttachmentStore,tenant:string){
  const current=await writable(db,a,k,id)
  const {rows:[file]}=await db.query(`SELECT *,expires_at<=clock_timestamp() AS expired FROM rms.attachment_intent WHERE ${sourceColumn(k)}=$1 AND id=$2 FOR UPDATE`,[id,fileId])
  if(!file)throw new NotFoundException()
  if(file.uploader_id!==a.id)throw new ForbiddenException()
  if(!file.attached_at){
    if(file.expired||current.revision!==file.resource_version)throw new ConflictException("Phiếu tải đã hết hạn hoặc đầu mục đã thay đổi.")
    await store.promote(tenant,file.id,file.size_bytes,file.mime,file.sha256)
    await db.query("UPDATE rms.attachment_intent SET attached_at=now() WHERE id=$1",[fileId])
    await appendAudit(db,a,k,id,"FILE_ATTACHED",{fileId,code:file.evidence_type,sha256:file.sha256})
  }
  return {id:fileId,filename:file.filename,sha256:file.sha256}
}
export async function downloadEntry(db:PoolClient,a:SessionAccount,k:FileKind,id:string,fileId:string,store:AttachmentStore,tenant:string){
  const record=await fileRecord(db,a,k,id)
  const file=record.files.find(f=>f.id===fileId)
  if(!file)throw new NotFoundException()
  return store.download(tenant,file.id,file.filename)
}

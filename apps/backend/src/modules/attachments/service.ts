import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { appendAudit } from "../audit/append.js"
import type { SessionAccount } from "../iam/account.js"
import { projectAccess } from "../proposal/access.js"
import { AttachmentStore,maxSize,supported } from "./store.js"

export type FileRequest = operations["createFileIntent"]["requestBody"]["content"]["application/json"]
async function fileAccess(db:PoolClient,actor:SessionAccount,id:string,write:boolean) {
  const p=await projectAccess(db,actor,id)
  if(write && actor.userType!=="admin" && !(actor.userType==="staff" && actor.unitId===p.unit_id) && !(actor.userType==="author" && actor.id===p.owner_id)){
    const member=p.status_semantic==="IN_PROGRESS"&&await db.query("SELECT 1 FROM rms.project_member WHERE project_id=$1 AND account_id=$2",[id,actor.id])
    if(!member||!member.rowCount)throw new ForbiddenException()
  }
  if(write && p.status_semantic==="SUBMITTED")throw new ConflictException("Hồ sơ đã nộp, cần trả lại trước khi sửa tệp.")
  if (write && ["CANCELLED","REJECTED","COMPLETED"].includes(p.status_semantic)) throw new ConflictException("Đề tài đã kết thúc.")
  return p
}
export function validateUpload(input:FileRequest){
  if(!input || typeof input.mime!=="string" || !Object.hasOwn(supported,input.mime) || !Number.isSafeInteger(input.size) || input.size<1 || input.size>maxSize ||
      typeof input.filename!=="string" || input.filename.trim().length<1 || input.filename.length>200 ||
      /[\\/\p{Cc}]/u.test(input.filename) || typeof input.sha256!=="string" || !/^[a-f0-9]{64}$/.test(input.sha256)) throw new BadRequestException("Thông tin tệp không hợp lệ.")
  const ext=input.filename.split(".").at(-1)?.toLowerCase()
  if (ext!==supported[input.mime] && !(ext==="jpeg" && input.mime==="image/jpeg")) throw new BadRequestException("Tên tệp và định dạng không khớp.")
}
export async function issueIntent(db:PoolClient,actor:SessionAccount,store:AttachmentStore,projectId:string,input:FileRequest) {
  const p=await fileAccess(db,actor,projectId,true)
  validateUpload(input)
  if(input.resourceVersion!==p.row_version) throw new ConflictException("Hồ sơ đã thay đổi.")
  const {rows:[intent]}=await db.query(`INSERT INTO rms.attachment_intent(tenant_id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,now()+interval '5 minutes') RETURNING id`,
    [projectId,p.row_version,actor.id,input.filename,input.mime,input.size,input.sha256])
  return {id:intent.id,...await store.form(p.tenant_id,intent.id,input.mime,input.size)}
}
export async function finalize(db:PoolClient,actor:SessionAccount,store:AttachmentStore,projectId:string,id:string) {
  const p=await fileAccess(db,actor,projectId,true)
  const {rows:[i]}=await db.query("SELECT *,expires_at<=clock_timestamp() AS expired FROM rms.attachment_intent WHERE project_id=$1 AND id=$2 FOR UPDATE",[projectId,id])
  if(!i) throw new NotFoundException()
  if(i.uploader_id!==actor.id) throw new ForbiddenException()
  if(!i.attached_at) {
    if(i.expired || i.resource_version!==p.row_version) throw new ConflictException("Phiếu tải tệp đã hết hạn hoặc hồ sơ đã thay đổi.")
    await store.promote(p.tenant_id,id,i.size_bytes,i.mime,i.sha256)
    await db.query("UPDATE rms.attachment_intent SET attached_at=now() WHERE id=$1",[id])
    await appendAudit(db,actor,"project",projectId,"FILE_ATTACHED",{fileId:id,sha256:i.sha256})
  }
  return {id,filename:i.filename,sha256:i.sha256}
}
export async function download(db:PoolClient,actor:SessionAccount,store:AttachmentStore,projectId:string,id:string) {
  const p=await fileAccess(db,actor,projectId,false)
  const {rows:[i]}=await db.query("SELECT filename FROM rms.attachment_intent WHERE id=$1 AND project_id=$2 AND attached_at IS NOT NULL",[id,projectId])
  if(!i) throw new NotFoundException()
  return store.download(p.tenant_id,id,i.filename)
}
export async function cleanExpired(db:PoolClient,store:AttachmentStore) {
  const {rows}=await db.query("SELECT tenant_id,id,attached_at FROM rms.attachment_intent WHERE expires_at<now() AND cleaned_at IS NULL ORDER BY expires_at LIMIT 50 FOR UPDATE SKIP LOCKED")
  for(const i of rows) {
    await store.remove("quarantine/"+i.tenant_id+"/"+i.id)
    if(!i.attached_at) await store.remove("files/"+i.tenant_id+"/"+i.id)
    await db.query("UPDATE rms.attachment_intent SET cleaned_at=now() WHERE id=$1",[i.id])
  }
  return rows.length
}

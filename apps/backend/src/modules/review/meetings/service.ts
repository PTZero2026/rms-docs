import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../../iam/account.js"
import {appendAudit} from "../../audit/append.js"
import {validateUpload,type FileRequest} from "../../attachments/service.js"
import type {AttachmentStore} from "../../attachments/store.js"

type Cmd=operations["createRoundMeeting"]["requestBody"]["content"]["application/json"]
type Meeting=operations["listRoundMeetings"]["responses"][200]["content"]["application/json"][number]
type Rounds=operations["listMeetingRounds"]["responses"][200]["content"]["application/json"]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i

export async function meetingRounds(db:PoolClient,a:SessionAccount):Promise<Rounds>{
  const result=await db.query<Rounds[number]>(`SELECT r.id,c.name||' · '||p.title AS title,r.kind,e.role='SECRETARY' AS secretary
    FROM rms.eligible_reviewer e JOIN rms.evaluation_round r ON (e.tenant_id,e.round_id)=(r.tenant_id,r.id)
    JOIN rms.committee c ON (c.tenant_id,c.id)=(r.tenant_id,r.committee_id)
    JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    WHERE e.account_id=$1 ORDER BY r.opened_at DESC,r.id`,[a.id])
  return result.rows
}
async function seat(db:PoolClient,a:SessionAccount,round:string,write=false){
  const {rows:[row]}=await db.query("SELECT role FROM rms.eligible_reviewer WHERE round_id=$1 AND account_id=$2",[round,a.id])
  if(!row)throw new NotFoundException()
  if(write&&row.role!=="SECRETARY")throw new ForbiddenException("Chỉ thư ký được phân công mới ghi biên bản.")
}
const details=`SELECT m.id,m.title,m.meeting_date::text AS date,m.revision,
    coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'filename',f.filename,'revision',f.resource_version+1,
      'actorId',f.uploader_id,'actor',coalesce(nullif(btrim(u.full_name),''),u.email),'attachedAt',f.attached_at) ORDER BY f.resource_version DESC)
      FROM rms.attachment_intent f JOIN rms.account u ON (u.tenant_id,u.id)=(f.tenant_id,f.uploader_id)
      WHERE (f.tenant_id,f.meeting_id)=(m.tenant_id,m.id) AND f.attached_at IS NOT NULL),'[]') AS files FROM rms.review_meeting m`
export async function meetings(db:PoolClient,a:SessionAccount,round:string){
  await seat(db,a,round)
  return (await db.query<Meeting>(details+" WHERE m.round_id=$1 ORDER BY m.meeting_date DESC,m.id",[round])).rows
}
export async function createMeeting(db:PoolClient,a:SessionAccount,round:string,cmd:Cmd){
  await seat(db,a,round,true)
  if(!cmd||!uuid.test(cmd.id)||typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>240||typeof cmd.date!=="string"||
    !/^\d{4}-\d\d-\d\d$/.test(cmd.date)||!Number.isFinite(Date.parse(cmd.date))||new Date(cmd.date).toISOString().slice(0,10)!==cmd.date)throw new BadRequestException("Kiểm tra tên và ngày họp.")
  const inserted=await db.query("INSERT INTO rms.review_meeting(tenant_id,id,round_id,title,meeting_date,creator_id) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",[cmd.id,round,cmd.title.trim(),cmd.date,a.id])
  const {rows:[item]}=await db.query<Meeting>(details+" WHERE m.id=$1 AND m.round_id=$2 AND m.title=$3 AND m.meeting_date=$4 AND m.creator_id=$5",[cmd.id,round,cmd.title.trim(),cmd.date,a.id])
  if(!item)throw new ConflictException("Mã cuộc họp đã được sử dụng.")
  if(inserted.rowCount)await appendAudit(db,a,"meeting",item.id,"MEETING_RECORDED",{round,date:cmd.date})
  return item
}
async function source(db:PoolClient,a:SessionAccount,id:string,write:boolean){
  const {rows:[meeting]}=await db.query(`SELECT m.round_id,m.revision,m.tenant_id,e.role FROM rms.review_meeting m
    JOIN rms.eligible_reviewer e ON (e.tenant_id,e.round_id)=(m.tenant_id,m.round_id)
    WHERE m.id=$1 AND e.account_id=$2`+(write?" FOR UPDATE OF m":""),[id,a.id])
  if(!meeting)throw new NotFoundException()
  if(write&&meeting.role!=="SECRETARY")throw new ForbiddenException()
  return meeting
}
export async function issueMinutes(db:PoolClient,a:SessionAccount,id:string,cmd:FileRequest,store:AttachmentStore){
  const meeting=await source(db,a,id,true)
  validateUpload(cmd)
  if(meeting.revision!==cmd.resourceVersion)throw new ConflictException("Biên bản đã có phiên bản mới.")
  const {rows:[file]}=await db.query(`INSERT INTO rms.attachment_intent(tenant_id,meeting_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,now()+interval '5 minutes') RETURNING id`,[id,cmd.resourceVersion,a.id,cmd.filename,cmd.mime,cmd.size,cmd.sha256])
  return {id:file.id,...await store.form(meeting.tenant_id,file.id,cmd.mime,cmd.size)}
}
export async function finishMinutes(db:PoolClient,a:SessionAccount,id:string,fileId:string,store:AttachmentStore){
  const meeting=await source(db,a,id,true)
  const {rows:[f]}=await db.query("SELECT *,expires_at<=clock_timestamp() AS expired FROM rms.attachment_intent WHERE id=$1 AND meeting_id=$2 FOR UPDATE",[fileId,id])
  if(!f)throw new NotFoundException()
  if(f.uploader_id!==a.id)throw new ForbiddenException()
  if(!f.attached_at){
    if(f.expired||meeting.revision!==f.resource_version)throw new ConflictException("Phiếu tải hết hạn hoặc biên bản đã thay đổi.")
    await store.promote(meeting.tenant_id,fileId,f.size_bytes,f.mime,f.sha256)
    await db.query("UPDATE rms.attachment_intent SET attached_at=now() WHERE id=$1",[fileId])
    await db.query("UPDATE rms.review_meeting SET revision=revision+1 WHERE id=$1",[id])
    await appendAudit(db,a,"meeting",id,"MEETING_MINUTES_ATTACHED",{round:meeting.round_id,fileId,revision:f.resource_version+1,sha256:f.sha256})
  }
  return {id:fileId,filename:f.filename,sha256:f.sha256}
}
export async function downloadMinutes(db:PoolClient,a:SessionAccount,id:string,fileId:string,store:AttachmentStore){
  const meeting=await source(db,a,id,false)
  const {rows:[f]}=await db.query("SELECT filename FROM rms.attachment_intent WHERE meeting_id=$1 AND id=$2 AND attached_at IS NOT NULL",[id,fileId])
  if(!f)throw new NotFoundException()
  return store.download(meeting.tenant_id,fileId,f.filename)
}

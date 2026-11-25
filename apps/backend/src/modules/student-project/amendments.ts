import {BadRequestException,ConflictException,ForbiddenException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"
import {peopleInUnit,studentRecord,validDescription,validateRoster,type Call} from "./confirm-mentor/service.js"

export type Amendment=operations["amendStudentProject"]["requestBody"]["content"]["application/json"]
type RecordRow=Awaited<ReturnType<typeof studentRecord>>

function amendmentStage(row:RecordRow){
  if(!row.canReview)throw new ForbiddenException()
  if(row.status==="MENTOR_PENDING"&&row.resumeStatus)return row.resumeStatus
  if(row.status==="APPROVED"||row.status==="IN_PROGRESS")return row.status
  throw new ConflictException("Chỉ điều chỉnh đề tài đã phê duyệt và chưa nộp kết quả cuối.")
}

export async function amendmentPeople(db:PoolClient,actor:SessionAccount,id:string){
  const row=await studentRecord(db,actor,id)
  amendmentStage(row)
  return (await peopleInUnit(db,row.unitId)).filter(p=>p.id!==actor.id)
}

export async function amendStudent(db:PoolClient,actor:SessionAccount,id:string,cmd:Amendment,calls:Call[]){
  const row=await studentRecord(db,actor,id,true)
  const resume=amendmentStage(row)
  if(!cmd||!Number.isSafeInteger(cmd.revision)||typeof cmd.reason!=="string"||!cmd.reason.trim()||cmd.reason.length>2000)
    throw new BadRequestException("Nhập lý do điều chỉnh và phiên bản hồ sơ.")
  if(cmd.revision!==row.revision)throw new ConflictException("Hồ sơ đã thay đổi. Hãy tải lại.")
  if(typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>500||!validDescription(cmd.objective)||!validDescription(cmd.product))
    throw new BadRequestException("Kiểm tra tên đề tài, mục tiêu và sản phẩm dự kiến.")
  if(!Array.isArray(cmd.members))throw new BadRequestException("Chọn thành viên từ danh sách sinh viên.")
  if(cmd.mentorId===actor.id||cmd.members.includes(actor.id))throw new ForbiddenException("Người duyệt thay đổi phải độc lập với nhóm và giảng viên hướng dẫn.")
  const sameMembers=cmd.members.length===row.members.length&&cmd.members.every(id=>row.members.includes(id))
  const legacyCall=calls.find(c=>c.unitId===row.unitId&&c.code===row.call)
  const min=row.groupMin??legacyCall?.min,max=row.groupMax??legacyCall?.max
  if(!sameMembers&&(min===undefined||max===undefined))throw new ConflictException("Cần giới hạn nhóm của đợt gốc để thay thành viên.")
  validateRoster(await peopleInUnit(db,row.unitId),row.leader,cmd,min??1,max??100)
  const before={title:row.title,objective:row.objective,product:row.product,mentorId:row.mentorId,members:row.members}
  const after={title:cmd.title.trim(),objective:cmd.objective.trim(),product:cmd.product.trim(),mentorId:cmd.mentorId,members:cmd.members}
  if(sameMembers&&before.title===after.title&&before.objective===after.objective&&before.product===after.product&&
      before.mentorId===after.mentorId&&!["DECLINED","RETURNED"].includes(row.mentorState))
    throw new BadRequestException("Hồ sơ chưa có thay đổi.")
  await db.query(`UPDATE rms.student_project SET title=$2,objective=$3,product=$4,mentor_id=$5,members=$6,reason=$7,
    resume_status=$8,status='MENTOR_PENDING',mentor_state='INVITED',mentor_revision_required=true,mentor_endorsed=false,
    group_min=$9,group_max=$10,revision=revision+1 WHERE id=$1`,
    [id,after.title,after.objective,after.product,after.mentorId,after.members,cmd.reason.trim(),resume,min??null,max??null])
  await appendAudit(db,actor,"student-project",id,"STUDENT_PROJECT_AMENDED",{from:row.status,to:"MENTOR_PENDING",
    fromMentor:row.mentorState,toMentor:"INVITED",resume,before,after,reason:cmd.reason.trim(),revision:row.revision+1})
  return studentRecord(db,actor,id)
}

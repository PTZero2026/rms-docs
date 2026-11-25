import {BadRequestException,ConflictException,ForbiddenException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"
import {studentRecord} from "./confirm-mentor/service.js"

export type Progress=operations["recordStudentProgress"]["requestBody"]["content"]["application/json"]
export async function recordProgress(db:PoolClient,actor:SessionAccount,id:string,cmd:Progress){
  const row=await studentRecord(db,actor,id,true)
  const role=actor.id===row.leader?"STUDENT":actor.id===row.mentorId?"MENTOR":null
  if(!role||!(await db.query("SELECT FROM rms.student_directory WHERE account_id=$1 AND kind=$2",[actor.id,role])).rowCount)throw new ForbiddenException()
  if(!cmd||!Number.isSafeInteger(cmd.revision)||typeof cmd.note!=="string"||!cmd.note.trim()||cmd.note.length>4000)
    throw new BadRequestException("Nhập nội dung tiến độ, tối đa 4.000 ký tự.")
  if(row.status!=="IN_PROGRESS"||row.revision!==cmd.revision)throw new ConflictException("Hồ sơ đã thay đổi hoặc đã kết thúc giai đoạn thực hiện.")
  const note=cmd.note.trim()
  await db.query("UPDATE rms.student_project SET progress_note=$2,progress_by=$3,progress_at=now(),revision=revision+1 WHERE id=$1",[id,note,actor.id])
  await appendAudit(db,actor,"student-project",id,"STUDENT_PROGRESS_RECORDED",{from:row.status,to:row.status,revision:cmd.revision+1,
    previousNote:row.progressNote,previousAuthor:row.progressBy,previousAt:row.progressAt,note})
  return studentRecord(db,actor,id)
}

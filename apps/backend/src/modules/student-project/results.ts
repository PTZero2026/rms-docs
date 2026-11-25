import {BadRequestException,ConflictException,ForbiddenException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import {appendAudit} from "../audit/append.js"
import type {SessionAccount} from "../iam/account.js"
import {enqueueStudentHours} from "../teaching-hour/teaching-hours/service.js"
import {calendarDay} from "@rms/api-contracts/teaching-calendar"
import {businessDay,studentRecord} from "./confirm-mentor/service.js"

export type ResultDecision=operations["decideStudentResult"]["requestBody"]["content"]["application/json"]
const transitions={
  submit:["IN_PROGRESS","FINAL_SUBMITTED"],
  endorse:["FINAL_SUBMITTED","FINAL_SUBMITTED"],
  revise:["FINAL_SUBMITTED","IN_PROGRESS"],
  pass:["FINAL_SUBMITTED","PASSED"],
  fail:["FINAL_SUBMITTED","FAILED"],
  reopen:["FAILED","IN_PROGRESS"],
  close:["PASSED","COMPLETED"]
} as const

export async function studentResult(db:PoolClient,actor:SessionAccount,id:string,cmd:ResultDecision,hoursEnabled:boolean){
  const row=await studentRecord(db,actor,id,true)
  if(!cmd||!Object.hasOwn(transitions,cmd.action)||!Number.isSafeInteger(cmd.revision)||
    typeof cmd.message!=="string"||cmd.message.length>4000)throw new BadRequestException("Thao tác hoặc nội dung kết quả chưa hợp lệ.")
  const {action}=cmd,message=cmd.message.trim()
  const mentor=row.mentorId===actor.id
  const permitted=action==="submit"?row.leader===actor.id:action==="endorse"?mentor:action==="revise"?mentor||row.canReview:row.canReview
  if(!permitted)throw new ForbiddenException()
  const [from,to]=transitions[action]
  if(row.revision!==cmd.revision||row.status!==from)throw new ConflictException("Hồ sơ đã thay đổi. Hãy tải lại kết quả.")
  if(action==="submit"){
    if(row.dueDate&&businessDay()>row.dueDate)throw new ConflictException("Đã hết hạn nộp kết quả.")
    if(!message)throw new BadRequestException("Nhập tóm tắt kết quả cuối.")
    const missing=row.finalEvidence.filter(e=>!row.files.some(f=>f.code===e.code))
    if(missing.length)throw new ConflictException("Còn thiếu minh chứng: "+missing.map(e=>e.label).join(", "))
    if(row.requireProgress&&!row.progressAt)throw new ConflictException("Đợt này yêu cầu ghi nhận tiến độ trước khi nộp kết quả.")
  }
  if(action==="reopen"&&(!calendarDay(cmd.dueDate)||cmd.dueDate<businessDay()))
    throw new BadRequestException("Chọn hạn nộp lại từ hôm nay trở đi.")
  if(action==="endorse"&&!(await db.query("SELECT FROM rms.student_directory WHERE account_id=$1 AND kind='MENTOR'",[actor.id])).rowCount)
    throw new ForbiddenException("Tài khoản chưa có trong danh sách giảng viên hướng dẫn hiện hành.")
  if(action==="endorse"&&row.mentorEndorsed)throw new ConflictException("Giảng viên đã xác nhận lượt kết quả này.")
  if((action==="revise"||action==="fail"||action==="reopen")&&!message)throw new BadRequestException("Nhập lý do để nhóm sinh viên theo dõi.")
  const judgment=action==="pass"||action==="fail"
  if(judgment&&row.requireMentorFinal&&!row.mentorEndorsed)throw new ConflictException("Cần giảng viên xác nhận bộ kết quả này trước khi nghiệm thu.")
  const requestHours=action==="close"&&hoursEnabled
  await db.query(`UPDATE rms.student_project SET status=$2,revision=revision+1,
    final_summary=CASE WHEN $3='submit' THEN $4 WHEN $3 IN ('revise','reopen') THEN '' ELSE final_summary END,
    final_round=final_round+CASE WHEN $3 IN ('revise','reopen') THEN 1 ELSE 0 END,
    mentor_endorsed=CASE WHEN $3='endorse' THEN true WHEN $3 IN ('revise','reopen') THEN false ELSE mentor_endorsed END,
    acceptance_date=CASE WHEN $5 THEN (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHEN $3='reopen' THEN NULL ELSE acceptance_date END,
    result_due_date=CASE WHEN $3='reopen' THEN $7::date ELSE result_due_date END,
    hours_requested=$6,reason=CASE WHEN $3 IN ('revise','reopen','fail','pass') THEN $4 WHEN $3='submit' THEN '' ELSE reason END WHERE id=$1`,
    [id,to,action,message,judgment,requestHours,action==="reopen"?cmd.dueDate:null])
  if(requestHours)await enqueueStudentHours(db,id)
  await appendAudit(db,actor,"student-project",id,action==="close"?"STUDENT_PROJECT_ACCEPTED":"STUDENT_RESULT_"+action.toUpperCase(),{
    from,to,revision:row.revision+1,round:row.finalRound,dueDate:action==="reopen"?cmd.dueDate:row.dueDate,reason:message,files:row.files.map(f=>f.id),mentorId:row.mentorId,hoursRequested:requestHours})
  return studentRecord(db,actor,id)
}

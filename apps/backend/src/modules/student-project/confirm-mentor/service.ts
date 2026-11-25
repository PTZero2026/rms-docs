import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../../iam/account.js"
import {appendAudit} from "../../audit/append.js"
import {readStudentCalls} from "@rms/api-contracts/student-calls"
type Page=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]
export type Call=Page["calls"][number]
type Item=Page["items"][number]
export type Draft=operations["registerStudentProject"]["requestBody"]["content"]["application/json"]
export type Answer=operations["respondStudentMentor"]["requestBody"]["content"]["application/json"]
type Decision=operations["decideStudentProject"]["requestBody"]["content"]["application/json"]
const fields=`SELECT id,title,objective,product,resume_status AS "resumeStatus",group_min AS "groupMin",group_max AS "groupMax",unit_id AS "unitId",call_code AS call,mentor_id AS "mentorId",members,leader,status,mentor_state AS "mentorState",reason,revision,mentor_revision_required AS "mentorRevisionRequired",on_approval AS "onApproval",
  final_evidence AS "finalEvidence",require_mentor_final AS "requireMentorFinal",hour_category AS "hourCategory",final_round AS "finalRound",
  final_summary AS "finalSummary",mentor_endorsed AS "mentorEndorsed",result_due_date::text AS "dueDate",acceptance_date::text AS "acceptanceDate",hours_requested AS "hoursRequested",
  require_progress AS "requireProgress",progress_note AS "progressNote",progress_by AS "progressBy",progress_at AS "progressAt",
  (SELECT coalesce(nullif(a.full_name,''),a.email) FROM rms.account a WHERE (a.tenant_id,a.id)=(student_project.tenant_id,student_project.progress_by)) AS "progressLabel",
  (SELECT coalesce(jsonb_agg(jsonb_build_object('id',f.id,'code',f.evidence_type,'filename',f.filename) ORDER BY f.attached_at,f.id),'[]'::jsonb)
     FROM rms.attachment_intent f WHERE (f.tenant_id,f.student_id,f.student_round)=(student_project.tenant_id,student_project.id,student_project.final_round)
     AND f.attached_at IS NOT NULL) AS files,
  (SELECT coalesce(nullif(m.full_name,''),m.email) FROM rms.account m
    WHERE (m.tenant_id,m.id)=(student_project.tenant_id,student_project.mentor_id)) AS "mentorLabel",
  ARRAY(SELECT coalesce(nullif(a.full_name,''),a.email) FROM unnest(student_project.members) WITH ORDINALITY AS ids(id,pos)
    JOIN rms.account a ON a.tenant_id=student_project.tenant_id AND a.id=ids.id ORDER BY ids.pos) AS "memberLabels",
  (($1='admin' OR ($1='staff' AND unit_id=$3)) AND mentor_id<>$2 AND NOT ($2=ANY(members))) AS "canReview" FROM rms.student_project
  WHERE ($1='admin' OR unit_id=$3 AND ($1='staff' OR $2=ANY(members) OR mentor_id=$2))`
const args=(a:SessionAccount)=>[a.userType,a.id,a.unitId]
export async function studentRecord(db:PoolClient,a:SessionAccount,id:string,lock=false){
  const {rows:[item]}=await db.query<Item>(fields+" AND id=$4"+(lock?" FOR UPDATE":""),[...args(a),id])
  if(!item)throw new NotFoundException()
  return item
}
export function businessDay(){return new Date(Date.now()+7*3600000).toISOString().slice(0,10)}
const defaultEvidence=[{code:"REPORT",label:"Báo cáo tổng kết"}]
export function parseCalls(text:string|null):Call[]{
  if(text===null)return []
  try{return readStudentCalls(text)}catch(e){throw new ConflictException(e instanceof Error?e.message:"Cấu hình đợt sinh viên chưa hợp lệ.")}
}
export async function peopleInUnit(db:PoolClient,unitId:string|null){
  return (await db.query<Page["people"][number]>(`SELECT a.id,coalesce(nullif(a.full_name,''),a.email) AS label,d.kind FROM rms.student_directory d
    JOIN rms.account a ON (a.tenant_id,a.id)=(d.tenant_id,d.account_id) WHERE a.is_active AND a.deleted_at IS NULL AND a.unit_id=$1 ORDER BY label,a.id`,[unitId])).rows
}
export async function listStudents(db:PoolClient,a:SessionAccount,calls:Call[]):Promise<Page>{
  const items=await db.query<Item>(fields+" ORDER BY title,id",args(a))
  const eligible=await peopleInUnit(db,a.unitId),allowed=eligible.some(p=>p.id===a.id)||a.userType==="staff"||a.userType==="admin"
  return {accountId:a.id,items:items.rows,people:allowed?eligible:[],calls:allowed?calls.filter(c=>c.unitId===a.unitId):[]}
}
async function validate(db:PoolClient,a:SessionAccount,cmd:Draft,calls:Call[]){
  const today=businessDay(),call=calls.find(c=>c.code===cmd.call&&c.unitId===a.unitId&&c.starts<=today&&today<=c.ends)
  if(!call)throw new ConflictException("Đợt đăng ký chưa mở hoặc đã đóng.")
  const directory=await peopleInUnit(db,a.unitId)
  if(!directory.some(p=>p.kind==="STUDENT"&&p.id===a.id))throw new ForbiddenException()
  validateRoster(directory,a.id,cmd,call.min,call.max)
  return call
}
export function validateRoster(directory:Page["people"],leader:string,cmd:Pick<Draft,"members"|"mentorId">,min:number,max:number){
  const students=new Set(directory.filter(p=>p.kind==="STUDENT").map(p=>p.id))
  if(!Array.isArray(cmd.members)||cmd.members.length<min||cmd.members.length>max||new Set(cmd.members).size!==cmd.members.length||
    !cmd.members.includes(leader)||cmd.members.some(id=>!students.has(id)))throw new BadRequestException("Nhóm chưa đủ điều kiện trong đợt.")
  if(!directory.some(p=>p.kind==="MENTOR"&&p.id===cmd.mentorId))throw new BadRequestException("Chọn giảng viên hướng dẫn thuộc đơn vị.")
}
export function validDescription(value:unknown):value is string{return typeof value==="string"&&value.length<=4000}
export async function registerStudent(db:PoolClient,a:SessionAccount,id:string,cmd:Draft,calls:Call[]){
  if(!cmd||typeof cmd.title!=="string"||!cmd.title.trim()||cmd.title.length>500)throw new BadRequestException("Cần tên đăng ký.")
  if(cmd.objective!==undefined&&!validDescription(cmd.objective)||cmd.product!==undefined&&!validDescription(cmd.product))
    throw new BadRequestException("Mục tiêu và sản phẩm dự kiến tối đa 4.000 ký tự mỗi mục.")
  await validate(db,a,cmd,calls)
  const out=await db.query(`INSERT INTO rms.student_project(tenant_id,id,unit_id,leader,title,call_code,mentor_id,members,objective,product) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT DO NOTHING`,[id,a.unitId,a.id,cmd.title.trim(),cmd.call,cmd.mentorId,cmd.members,cmd.objective?.trim()??"",cmd.product?.trim()??""])
  let prev:Item|undefined
  if(!out.rowCount){
    prev=await studentRecord(db,a,id,true)
    if(prev.leader!==a.id)throw new ForbiddenException()
    if(prev.status!=="DRAFT"||!["DECLINED","RETURNED","RECONFIRM_REQUIRED"].includes(prev.mentorState))throw new ConflictException("Đăng ký đang chờ xử lý hoặc đã được xác nhận.")
    await db.query("UPDATE rms.student_project SET title=$2,call_code=$3,mentor_id=$4,members=$5,objective=coalesce($6,objective),product=coalesce($7,product),mentor_state='INVITED',reason='',revision=revision+1 WHERE id=$1",[id,cmd.title.trim(),cmd.call,cmd.mentorId,cmd.members,cmd.objective?.trim()??null,cmd.product?.trim()??null])
  }
  await appendAudit(db,a,"student-project",id,"MENTOR_INVITED",{mentorId:cmd.mentorId,call:cmd.call,
    from:prev?.status??null,to:"DRAFT",fromMentor:prev?.mentorState??null,toMentor:"INVITED",revision:(prev?.revision??0)+1})
  return studentRecord(db,a,id)
}
export async function answerMentor(db:PoolClient,a:SessionAccount,id:string,action:Answer["action"],reason:string,revision?:number){
  const entry=await studentRecord(db,a,id,true)
  const directory=await peopleInUnit(db,entry.unitId)
  if(entry.mentorId!==a.id||!directory.some(p=>p.id===a.id&&p.kind==="MENTOR"))throw new ForbiddenException()
  if((entry.mentorRevisionRequired||revision!==undefined)&&revision!==entry.revision)throw new ConflictException("Lời mời đã thay đổi. Hãy mở lại bản đăng ký hiện tại.")
  if(!["DRAFT","MENTOR_PENDING"].includes(entry.status)||entry.mentorState!=="INVITED")throw new ConflictException("Lời mời đã được xử lý.")
  if(!["accept","decline","return"].includes(action)||typeof reason!=="string"||reason.length>2000||action!=="accept"&&!reason.trim())throw new BadRequestException("Cần lý do khi từ chối hoặc yêu cầu sửa.")
  const state=action==="accept"?"ACCEPTED":action==="decline"?"DECLINED":"RETURNED"
  const resume=action==="accept"&&entry.status==="MENTOR_PENDING"?entry.resumeStatus:null
  if(resume)validateRoster(directory,entry.leader,entry,entry.groupMin??1,entry.groupMax??100)
  await db.query("UPDATE rms.student_project SET mentor_state=$2,reason=$3,status=coalesce($4,status),resume_status=CASE WHEN $4::text IS NULL THEN resume_status END,revision=revision+1 WHERE id=$1",[id,state,reason.trim(),resume])
  await appendAudit(db,a,"student-project",id,"MENTOR_"+state,{reason:reason.trim(),mentorId:a.id,from:entry.status,to:resume??entry.status,
    fromMentor:entry.mentorState,toMentor:state,revision:entry.revision+1})
  return studentRecord(db,a,id)
}
export async function submitStudent(db:PoolClient,a:SessionAccount,id:string,calls:Call[]){
  const entry=await studentRecord(db,a,id,true)
  if(entry.leader!==a.id)throw new ForbiddenException()
  if(entry.status!=="DRAFT")throw new ConflictException("Đăng ký đã nộp.")
  const call=await validate(db,a,entry,calls)
  if(entry.mentorState!=="ACCEPTED")throw new ConflictException("Thiếu xác nhận của giảng viên cho đăng ký này.")
  await db.query(`UPDATE rms.student_project SET status='SUBMITTED',on_approval=$2,final_evidence=$3::jsonb,require_mentor_final=$4,
    hour_category=$5,group_min=$6,group_max=$7,require_progress=$8,result_due_date=$9,revision=revision+1 WHERE id=$1`,
    [id,call.onApproval??"APPROVED",JSON.stringify(call.finalEvidence??defaultEvidence),call.requireMentorFinal??true,call.hourCategory??"STUDENT_PROJECT",
      call.min,call.max,call.requireProgress??false,call.finalDue??null])
  await appendAudit(db,a,"student-project",id,"STUDENT_PROJECT_SUBMITTED",{from:entry.status,to:"SUBMITTED",mentorId:entry.mentorId,call:entry.call,revision:entry.revision+1})
  return studentRecord(db,a,id)
}

export async function decideStudent(db:PoolClient,actor:SessionAccount,id:string,cmd:Decision){
  const entry=await studentRecord(db,actor,id,true)
  if(!entry.canReview)throw new ForbiddenException()
  if(!cmd||!["approve","return","start"].includes(cmd.action)||!Number.isSafeInteger(cmd.revision)||typeof cmd.reason!=="string"||cmd.reason.length>2000)
    throw new BadRequestException("Quyết định khoa chưa hợp lệ.")
  if(entry.revision!==cmd.revision||entry.status!==(cmd.action==="start"?"APPROVED":"SUBMITTED"))
    throw new ConflictException("Đăng ký đã thay đổi. Hãy tải lại.")
  const reason=cmd.reason.trim()
  if(cmd.action==="return"&&!reason)throw new BadRequestException("Nhập lý do khoa yêu cầu bổ sung.")
  if(cmd.action!=="return"){
    const eligible=await db.query(`SELECT count(*)::int AS n FROM rms.student_directory d JOIN rms.account a
      ON (a.tenant_id,a.id)=(d.tenant_id,d.account_id) WHERE a.unit_id=$1 AND a.is_active AND a.deleted_at IS NULL
      AND ((d.kind='STUDENT' AND a.id=ANY($2::uuid[])) OR (d.kind='MENTOR' AND a.id=$3))`,[entry.unitId,entry.members,entry.mentorId])
    if(eligible.rows[0].n!==entry.members.length+1||entry.mentorState!=="ACCEPTED")throw new ConflictException("Kiểm tra nhóm và giảng viên hướng dẫn trước khi phê duyệt.")
  }
  const status=cmd.action==="return"?"DRAFT":cmd.action==="start"?"IN_PROGRESS":entry.onApproval
  await db.query("UPDATE rms.student_project SET status=$2,reason=$3,mentor_state=$4,mentor_revision_required=mentor_revision_required OR $4='RECONFIRM_REQUIRED',revision=revision+1 WHERE id=$1",
    [id,status,reason,cmd.action==="return"?"RECONFIRM_REQUIRED":entry.mentorState])
  const event={approve:"STUDENT_PROJECT_APPROVED",return:"STUDENT_PROJECT_RETURNED",start:"STUDENT_PROJECT_STARTED"}[cmd.action]
  await appendAudit(db,actor,"student-project",id,event,{from:entry.status,to:status,reason,revision:entry.revision+1,mentorId:entry.mentorId,call:entry.call})
  return studentRecord(db,actor,id)
}

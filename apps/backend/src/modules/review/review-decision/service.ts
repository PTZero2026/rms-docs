import { BadRequestException,ConflictException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../../iam/account.js"
import { appendAudit } from "../../audit/append.js"
import { moveTo } from "../../workflow/move-to.js"
import { managedRound,type RoundKind } from "../open-review/service.js"

type Ethics=operations["recordReviewEthics"]["requestBody"]["content"]["application/json"]
type Result=operations["getReviewResult"]["responses"][200]["content"]["application/json"]
export interface ReviewPolicy {minimum:number;passing:number}
async function publish(db:PoolClient,actor:SessionAccount,id:string) {
  const round=await managedRound(db,actor,id)
  if(!round.conclusion || (round.conclusion==="PASSED" && ["PENDING","SUPPLEMENT"].includes(round.ethics)))return round
  const target=round.conclusion==="FAILED" || round.ethics==="REJECTED"?"REJECTED":"APPROVED"
  if(round.projectStatus===target)return round
  if(round.projectStatus!=="UNDER_REVIEW")throw new ConflictException("Đề tài đã chuyển bước.")
  const {rows:[p]}=await db.query("SELECT row_version FROM rms.research_project WHERE id=$1",[round.projectId])
  const reason=round.conclusion==="FAILED"?"Điểm khoa học dưới ngưỡng đã chốt.":round.ethicsNote??undefined
  await moveTo(db,actor,round.projectId,target,p.row_version,reason)
  return {...round,projectStatus:target}
}
export async function conclude(db:PoolClient,actor:SessionAccount,id:string,policy:ReviewPolicy,kind:RoundKind="PROPOSAL_REVIEW",expectedRevision=0) {
  const r=await managedRound(db,actor,id,true,kind)
  if(r.decisionRevision!==expectedRevision)throw new ConflictException("Vòng đã được mở lại. Hãy tải lại trước khi chốt.")
  if(r.conclusion)return r
  const max=r.criteria.reduce((sum,c)=>sum+c.maxScore*c.weight,0)
  if(!Number.isSafeInteger(policy.minimum)||policy.minimum<=0||!Number.isFinite(policy.passing)||policy.passing<0||policy.passing>max)
    throw new ConflictException("Cấu hình số phiếu hoặc ngưỡng điểm B01 chưa hợp lệ.")
  const {rows:[stats]}=await db.query(`SELECT count(*)::int AS count,round(avg(s.total),2)::float8 AS mean,array_agg(s.id ORDER BY s.id) AS sheets
    FROM rms.score_sheet s JOIN rms.eligible_reviewer e ON (e.tenant_id,e.round_id,e.account_id)=(s.tenant_id,s.round_id,s.account_id)
    WHERE s.round_id=$1 AND s.submitted_at IS NOT NULL`,[id])
  if(stats.count<policy.minimum)throw new ConflictException("Còn thiếu "+(policy.minimum-stats.count)+" phiếu hợp lệ.")
  const conclusion=stats.mean>=policy.passing?"PASSED":"FAILED"
  const decision={...policy,count:stats.count,mean:stats.mean,sheets:stats.sheets}
  await db.query("UPDATE rms.evaluation_round SET decision=$2,conclusion=$3,concluded_at=clock_timestamp() WHERE id=$1",[id,decision,conclusion])
  await appendAudit(db,actor,"review",id,kind==="ACCEPTANCE"?"ACCEPTANCE_CONCLUDED":"SCIENCE_CONCLUDED",{...decision,conclusion})
  if(kind==="ACCEPTANCE"){
    if(r.projectStatus!=="UNDER_ACCEPTANCE")throw new ConflictException("Đề tài đã chuyển bước.")
    const {rows:[project]}=await db.query("SELECT row_version FROM rms.research_project WHERE id=$1",[r.projectId])
    await moveTo(db,actor,r.projectId,conclusion,project.row_version,conclusion==="FAILED"?"Điểm nghiệm thu dưới ngưỡng.":undefined)
    return managedRound(db,actor,id,false,kind)
  }
  return publish(db,actor,id)
}
export async function recordEthics(db:PoolClient,actor:SessionAccount,id:string,input:Ethics){
  const r=await managedRound(db,actor,id,true)
  if(!input || !["SUPPLEMENT","APPROVED","REJECTED"].includes(input.result) || typeof input.note!=="string" || !input.note.trim() || input.note.length>4000)
    throw new BadRequestException("Cần nhập căn cứ của hội đồng đạo đức.")
  const note=input.note.trim()
  if(r.ethics===input.result && r.ethicsNote===note)return r
  if(r.projectStatus!=="UNDER_REVIEW" || !["PENDING","SUPPLEMENT"].includes(r.ethics))throw new ConflictException("Hồ sơ không chờ kết quả đạo đức.")
  await db.query("UPDATE rms.evaluation_round SET ethics=$2,ethics_note=$3 WHERE id=$1",[id,input.result,note])
  await appendAudit(db,actor,"review",id,"ETHICS_RECORDED",{from:r.ethics,result:input.result,note})
  return publish(db,actor,id)
}
export async function reviewResult(db:PoolClient,actor:SessionAccount,project:string,publicComments:boolean):Promise<Result> {
  const {rows:[r]}=await db.query(`SELECT p.status_semantic AS "projectStatus",r.conclusion,r.ethics,r.ethics_note AS "ethicsNote",r.decision
    FROM rms.research_project p JOIN rms.evaluation_round r ON (r.tenant_id,r.project_id)=(p.tenant_id,p.id)
    WHERE p.id=$1 AND p.owner_id=$2 AND r.kind='PROPOSAL_REVIEW'`,[project,actor.id])
  if(!r)throw new NotFoundException()
  const {decision,...result}=r
  const comments=publicComments&&decision?await db.query(`SELECT comment FROM rms.score_sheet WHERE id=ANY($1::uuid[])
    AND submitted_at IS NOT NULL AND comment<>'' ORDER BY id`,[decision.sheets]):undefined
  return {...result,comments:comments?.rows.map(s=>s.comment)??[]} as Result
}

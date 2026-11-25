import { BadRequestException,ConflictException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { RoundKind } from "../open-review/service.js"
import type { SessionAccount } from "../../iam/account.js"
import { appendAudit } from "../../audit/append.js"

type Input=operations["saveReviewSheet"]["requestBody"]["content"]["application/json"]
type Sheet=operations["saveReviewSheet"]["responses"][200]["content"]["application/json"]
type Criteria=operations["getManagedRound"]["responses"][200]["content"]["application/json"]["criteria"]
export async function saveSheet(db:PoolClient,actor:SessionAccount,id:string,input:Input,kind:RoundKind="PROPOSAL_REVIEW"):Promise<Sheet>{
  const source=await db.query(`SELECT r.id,r.project_id,r.concluded_at,r.criteria->'definition'->'items' AS items
    FROM rms.evaluation_round r JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    JOIN rms.eligible_reviewer e ON (e.tenant_id,e.round_id)=(r.tenant_id,r.id)
    WHERE r.id=$1 AND r.kind=$3 AND e.account_id=$2 FOR UPDATE OF p,r`,[id,actor.id,kind])
  const r=source.rows[0]
  if(!r || !(await db.query("SELECT 1 FROM rms.eligible_reviewer WHERE round_id=$1 AND account_id=$2",[id,actor.id])).rowCount)throw new NotFoundException()
  if(r.concluded_at)throw new ConflictException("Đợt đã chốt.")
  if(!input || typeof input.submit!=="boolean" || typeof input.comment!=="string" || input.comment.length>4000 ||
    !input.points || typeof input.points!=="object" || Array.isArray(input.points))throw new BadRequestException("Phiếu chấm không hợp lệ.")
  const criteria=r.items as Criteria
  for(const [key,value] of Object.entries(input.points)){
    const criterion=criteria.find(c=>c.key===key)
    if(!criterion || !Number.isFinite(value)||value<0||value>criterion.maxScore)throw new BadRequestException("Điểm ngoài giới hạn của tiêu chí.")
  }
  if(input.submit && criteria.some(c=>!Object.hasOwn(input.points,c.key)))throw new BadRequestException("Cần đủ điểm cho mọi tiêu chí.")
  const {rows:[sheet]}=await db.query<Sheet>(`INSERT INTO rms.score_sheet(tenant_id,round_id,account_id,points,comment,total,submitted_at)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,CASE WHEN $5 THEN
      (SELECT round(sum((item->>'weight')::numeric * ($3::jsonb->>(item->>'key'))::numeric),2) FROM jsonb_array_elements($6::jsonb) item) END,
      CASE WHEN $5 THEN clock_timestamp() END)
    ON CONFLICT(tenant_id,round_id,account_id) DO UPDATE SET points=excluded.points,comment=excluded.comment,total=excluded.total,submitted_at=excluded.submitted_at
    WHERE rms.score_sheet.submitted_at IS NULL RETURNING id,points,comment,total::float8,submitted_at IS NOT NULL AS submitted`,
    [id,actor.id,input.points,input.comment.trim(),input.submit,JSON.stringify(criteria)])
  if(!sheet)throw new ConflictException("Phiếu đã gửi và đã khóa.")
  await appendAudit(db,actor,"review",id,input.submit?"SCORE_SUBMITTED":"SCORE_DRAFT_SAVED",{sheetId:sheet.id})
  return sheet
}

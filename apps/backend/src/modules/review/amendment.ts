import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import type { PoolClient } from "pg"
import { appendAudit } from "../audit/append.js"
import type { SessionAccount } from "../iam/account.js"
import { notifyRecipients } from "../notification/emit.js"
import { transition } from "../workflow/kernel.js"
import { staffUnit } from "./open-review/service.js"

type State = operations["getRoundAmendment"]["responses"][200]["content"]["application/json"]
type Command = operations["amendRound"]["requestBody"]["content"]["application/json"]
interface Source {
  project_id: string
  kind: "PROPOSAL_REVIEW" | "ACCEPTANCE"
  status_semantic: string
  row_version: number
  conclusion: string | null
  locked: boolean
}

async function source(db: PoolClient, actor: SessionAccount, id: string, write: boolean) {
  const {rows:[round]} = await db.query<Source>(`SELECT r.project_id,r.kind,r.conclusion,p.status_semantic,p.row_version,
    CASE WHEN r.kind='PROPOSAL_REVIEW' THEN EXISTS (SELECT 1 FROM rms.project_assignment a WHERE a.project_id=p.id)
    ELSE EXISTS (SELECT 1 FROM rms.acceptance_request q WHERE q.project_id=p.id AND q.attempt>r.acceptance_attempt)
      OR EXISTS (SELECT 1 FROM rms.budget_allocation b WHERE b.project_id=p.id AND b.settled_at IS NOT NULL) END AS locked
    FROM rms.evaluation_round r JOIN rms.research_project p ON (p.tenant_id,p.id)=(r.tenant_id,r.project_id)
    WHERE r.id=$1 AND p.unit_id=$2 AND p.owner_id<>$3
    AND NOT EXISTS (SELECT 1 FROM rms.project_member m WHERE m.project_id=p.id AND m.account_id=$3)
    ${write?"FOR UPDATE OF p,r":""}`,[id,staffUnit(actor),actor.id])
  if (!round) throw new NotFoundException()
  return round
}

async function reopenRoute(db: PoolClient, r: Source): Promise<{action: Command["action"]; edge?: string}> {
  if (r.locked) return {action:"REFER"}
  const proposal = r.kind==="PROPOSAL_REVIEW"
  if (proposal && r.status_semantic==="UNDER_REVIEW") return {action:"REOPEN"}
  if (!(proposal?["APPROVED","REJECTED"]:["PASSED","FAILED"]).includes(r.status_semantic)) return {action:"REFER"}
  // Return to the exact step that published this decision, including locally named steps.
  const {rows} = await db.query<{code:string}>(`SELECT e.code FROM rms.workflow_instance i
    JOIN LATERAL (SELECT h.from_step,h.to_step,h.template_version FROM rms.workflow_history h
      WHERE (h.tenant_id,h.project_id)=(i.tenant_id,i.project_id) ORDER BY h.revision DESC LIMIT 1) h
      ON h.template_version=i.version AND h.to_step=i.current_step
    JOIN rms.workflow_step s ON (s.tenant_id,s.version,s.code)=(i.tenant_id,i.version,h.from_step)
    JOIN rms.workflow_edge e ON (e.tenant_id,e.version,e.from_step,e.to_step)=(i.tenant_id,i.version,i.current_step,h.from_step)
    WHERE i.project_id=$1 AND s.semantic=$2 AND 'staff'=ANY(e.roles)`,[r.project_id,proposal?"UNDER_REVIEW":"UNDER_ACCEPTANCE"])
  return rows.length===1?{action:"REOPEN",edge:rows[0].code}:{action:"REFER"}
}

async function history(db: PoolClient, id: string) {
  const result = await db.query<State["history"][number]>(`SELECT h.revision,h.action,h.reason,a.email AS actor,b.email AS recipient,
    h.conclusion,(decision->>'mean')::float8 AS mean,(decision->>'count')::int AS count,
    (decision->>'passing')::float8 AS passing,(decision->>'minimum')::int AS minimum,h.ethics,h.ethics_note AS "ethicsNote",
    h.project_status AS "projectStatus",to_jsonb(h.concluded_at) AS "concludedAt",to_jsonb(h.created_at) AS "createdAt"
    FROM rms.round_amendment h JOIN rms.account a ON (a.tenant_id,a.id)=(h.tenant_id,h.actor_id)
    LEFT JOIN rms.account b ON (b.tenant_id,b.id)=(h.tenant_id,h.recipient_id)
    WHERE h.round_id=$1 ORDER BY h.revision DESC`,[id])
  return result.rows
}
const recipientQuery = `SELECT a.id,a.email AS label FROM rms.account a JOIN rms.research_project p ON p.tenant_id=a.tenant_id
  WHERE p.id=$1 AND a.is_active AND a.deleted_at IS NULL AND a.user_type='admin' AND p.owner_id<>a.id
  AND NOT EXISTS(SELECT 1 FROM rms.project_member m WHERE m.project_id=p.id AND m.account_id=a.id)`

export async function amendmentState(db: PoolClient, actor: SessionAccount, id: string): Promise<State> {
  const r = await source(db,actor,id,false)
  const entries = await history(db,id)
  const action = r.conclusion && entries[0]?.action!=="REFER" ? (await reopenRoute(db,r)).action : null
  const recipients = action==="REFER" ? (await db.query<State["recipients"][number]>(recipientQuery+" ORDER BY a.email,a.id",[r.project_id])).rows : []
  return {action,recipients,history:entries,revision:entries[0]?.revision??0}
}

export async function amendRound(db: PoolClient, actor: SessionAccount, id: string, cmd: Command): Promise<State> {
  const r = await source(db,actor,id,true)
  if (typeof cmd?.reason!=="string" || !cmd.reason.trim() || cmd.reason.length>2000 || !Number.isSafeInteger(cmd.revision) || cmd.revision<0 ||
      !["REOPEN","REFER"].includes(cmd.action)) throw new BadRequestException("Cần lý do và phiên bản kết luận hợp lệ.")
  const {rows:[latest]} = await db.query("SELECT revision,action FROM rms.round_amendment WHERE round_id=$1 ORDER BY revision DESC LIMIT 1",[id])
  if (!r.conclusion || latest?.action==="REFER" || (latest?.revision??0)!==cmd.revision)
    throw new ConflictException("Kết luận đã thay đổi. Hãy tải lại vòng hội đồng.")
  const route = await reopenRoute(db,r)
  if (route.action!==cmd.action) throw new ConflictException("Hồ sơ đã chuyển bước. Hãy tải lại cách xử lý.")
  const reason = cmd.reason.trim()
  if (route.action==="REFER") {
    if (typeof cmd.recipientId!=="string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(cmd.recipientId) ||
        !(await db.query(recipientQuery+" AND a.id=$2 FOR SHARE OF a",[r.project_id,cmd.recipientId])).rowCount)
      throw new BadRequestException("Chọn chủ quy trình có quyền quản trị còn hiệu lực của trường.")
  } else if (cmd.recipientId!==undefined) throw new BadRequestException("Chỉ chọn người nhận khi chuyển đính chính.")
  const revision = cmd.revision+1
  const audit = await appendAudit(db,actor,"review",id,route.action==="REOPEN"?"ROUND_REOPENED":"ROUND_CORRECTION_REQUESTED",
    {projectId:r.project_id,kind:r.kind,revision,reason,previousConclusion:r.conclusion,recipientId:cmd.recipientId})
  await db.query(`INSERT INTO rms.round_amendment(tenant_id,round_id,revision,action,reason,actor_id,recipient_id,audit_id,
    conclusion,decision,ethics,ethics_note,project_status,concluded_at)
    SELECT tenant_id,id,$2,$3,$4,$5,$6,$7,conclusion,decision,ethics,ethics_note,$8,concluded_at
    FROM rms.evaluation_round WHERE id=$1`,[id,revision,route.action,reason,actor.id,cmd.recipientId??null,audit,r.status_semantic])
  if (route.action==="REFER") {
    await notifyRecipients(db,"ROUND_CORRECTION_REQUESTED",r.project_id,audit,[cmd.recipientId!],{roundId:id,revision})
  } else {
    if (route.edge) await transition(db,actor,{projectId:r.project_id,code:route.edge,expectedVersion:r.row_version,reason})
    await db.query("UPDATE rms.evaluation_round SET conclusion=NULL,decision=NULL,concluded_at=NULL,decision_revision=decision_revision+1 WHERE id=$1",[id])
  }
  return amendmentState(db,actor,id)
}

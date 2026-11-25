import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../iam/account.js"
import { appendAudit } from "../audit/append.js"

export async function finalizeProposal(db:PoolClient,actor:SessionAccount,id:string) {
  if(actor.userType!=="staff" || !actor.unitId)throw new ForbiddenException()
  const {rows:[source]}=await db.query(`SELECT p.status_semantic,d.finalized_at,c.status FROM rms.research_project p
    JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id)
    WHERE p.id=$1 AND p.unit_id=$2 FOR UPDATE OF p,d FOR SHARE OF c`,[id,actor.unitId])
  if(!source)throw new NotFoundException()
  if(source.status_semantic!=="SUBMITTED" || source.status!=="CLOSED")throw new ConflictException("Cần hồ sơ đã nộp thuộc kỳ đã đóng.")
  if(!source.finalized_at){
    await db.query("UPDATE rms.proposal_document SET finalized_at=now(),finalized_by=$2 WHERE project_id=$1",[id,actor.id])
    await appendAudit(db,actor,"project",id,"PROPOSAL_FINALIZED")
  }
  return {id,finalized:true}
}

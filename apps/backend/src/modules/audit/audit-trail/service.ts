import { BadRequestException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../../iam/account.js"
import { projectAccess,offset } from "../../proposal/access.js"

type Trail=operations["getProjectTrail"]["responses"][200]["content"]["application/json"]
function instant(value:unknown) {
  if (value===undefined)return null
  if(typeof value!=="string" || !/^\d{4}-\d\d-\d\dT.*(Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value)))throw new BadRequestException()
  return new Date(value)
}
export async function projectTrail(db:PoolClient,actor:SessionAccount,id:string,query:Record<string,unknown>):Promise<Trail> {
  const project=await projectAccess(db,actor,id)
  const from=instant(query.from), to=instant(query.to)
  if(from && to && from>to)throw new BadRequestException()
  const values=[id,from,to]
  const where=" FROM rms.audit_log WHERE target_type='project' AND target_id=$1 AND ($2::timestamptz IS NULL OR occurred_at >= $2) AND ($3::timestamptz IS NULL OR occurred_at <= $3)"
  const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total"+where,values)
  const {rows:items}=await db.query(`SELECT id,action,occurred_at AS at,
    CASE WHEN actor_id IS NULL THEN service_kind ELSE 'HUMAN' END AS "actorType",
    coalesce(actor_label,actor_id::text,actor_service) AS "actorLabel",
    coalesce(actor_unit_label,actor_unit_id::text) AS "unitLabel",on_behalf_of AS "onBehalfOf",
    details->>'from' AS before,coalesce(details->>'to',details->>'step') AS after,details->>'reason' AS reason
    ${where} ORDER BY occurred_at DESC,id LIMIT 25 OFFSET $4`,[...values,offset(query.skip)])
  return {project:{id:project.id,title:project.title,status:project.status,version:project.version,hasProposal:project.hasProposal},items,total}
}

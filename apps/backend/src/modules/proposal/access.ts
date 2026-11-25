import { BadRequestException, NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../iam/account.js"

const scope=`($1='admin' OR ($1='staff' AND p.unit_id=$2::uuid) OR ($1='author' AND p.owner_id=$3::uuid) OR EXISTS(SELECT 1 FROM rms.project_member m WHERE (m.tenant_id,m.project_id)=(p.tenant_id,p.id) AND m.account_id=$3::uuid))`
const visible='p.id,p.title,p.status,p.row_version AS version,(p.call_id IS NOT NULL) AS "hasProposal"'
const scopeValues=(actor:SessionAccount)=>[actor.userType,actor.unitId,actor.id]
export function offset(value:unknown) {
  if (value===undefined) return 0
  if ((typeof value!=="string" && typeof value!=="number") || !/^\d{1,9}$/.test(String(value))) throw new BadRequestException()
  return Number(value)
}
export async function projectAccess(db:PoolClient,actor:SessionAccount,id:string,write=false) {
  const {rows:[project]}=await db.query(`SELECT ${visible},p.tenant_id,p.unit_id,p.owner_id,p.row_version,p.status_semantic
    FROM rms.research_project p WHERE ${scope} AND p.id=$4 FOR ${write?"UPDATE":"SHARE"} OF p`,[...scopeValues(actor),id])
  if (!project) throw new NotFoundException()
  return project
}
export async function listProjects(db:PoolClient,actor:SessionAccount,search:unknown,skip:unknown) {
  if (search!==undefined && (typeof search!=="string" || search.length>256)) throw new BadRequestException()
  const params=[...scopeValues(actor),search??""]
  const from=` FROM rms.research_project p WHERE ${scope} AND strpos(lower(p.title),lower($4))>0`
  const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total"+from,params)
  const {rows:items}=await db.query(`SELECT ${visible}${from} ORDER BY p.title,p.id LIMIT 20 OFFSET $5`,[...params,offset(skip)])
  return {items,total}
}

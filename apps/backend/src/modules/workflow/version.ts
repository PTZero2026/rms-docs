import { ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { components,operations } from "@rms/api-contracts"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import type { SessionAccount } from "../iam/account.js"
import { projectAccess } from "../proposal/access.js"

export async function activeTemplate(db:PoolClient,actor:SessionAccount):Promise<components["schemas"]["WorkflowTemplate"]> {
  if(actor.userType!=="admin")throw new ForbiddenException()
  const {rows:[current]}=await db.query("SELECT version FROM rms.workflow_active")
  if(!current)return {version:0,graph:defaultWorkflow()}
  const {rows:steps}=await db.query("SELECT code,semantic,initial,final FROM rms.workflow_step WHERE version=$1 ORDER BY initial DESC,code",[current.version])
  const {rows:transitions}=await db.query('SELECT code,from_step AS "from",to_step AS "to",roles::text[] AS roles,requires_comment AS "requiresComment",guards,effects FROM rms.workflow_edge WHERE version=$1 ORDER BY code',[current.version])
  return {version:current.version,graph:{steps,transitions}}
}
export async function readInstance(db:PoolClient,actor:SessionAccount,id:string):Promise<operations["getProjectWorkflow"]["responses"][200]["content"]["application/json"]> {
  const p=await projectAccess(db,actor,id)
  const {rows:[instance]}=await db.query("SELECT version,current_step AS step FROM rms.workflow_instance WHERE project_id=$1",[id])
  if(!instance)throw new NotFoundException()
  const {rows:next}=await db.query('SELECT code,to_step AS "to" FROM rms.workflow_edge WHERE version=$1 AND from_step=$2 AND $3=ANY(roles) ORDER BY code',[instance.version,instance.step,actor.userType])
  return {...instance,semantic:p.status_semantic,next}
}

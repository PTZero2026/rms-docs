import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../iam/account.js"
import { appendAudit } from "../audit/append.js"
import { validateGraph, type Graph } from "./graph.js"

export async function activateGraph(db: PoolClient, actor: SessionAccount, graph: Graph, expected: number) {
  if(actor.userType!=="admin") throw new ForbiddenException()
  validateGraph(graph)
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text,1))")
  const {rows:[active]} = await db.query("SELECT version FROM rms.workflow_active")
  if((active?.version??0)!==expected) throw new ConflictException("Phiên bản quy trình đã thay đổi.")
  const version = expected+1
  await db.query("INSERT INTO rms.workflow_template VALUES(rms.current_tenant(),$1)",[version])
  for(const step of graph.steps) await db.query(
    "INSERT INTO rms.workflow_step VALUES(rms.current_tenant(),$1,$2,$3,$4,$5)",
    [version,step.code,step.semantic,step.initial,step.final],
  )
  for(const e of graph.transitions) await db.query(
    "INSERT INTO rms.workflow_edge VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8)",
    [version,e.code,e.from,e.to,e.roles,e.requiresComment,e.guards,e.effects],
  )
  await db.query("INSERT INTO rms.workflow_active VALUES(rms.current_tenant(),$1) ON CONFLICT(tenant_id) DO UPDATE SET version=excluded.version",[version])
  await appendAudit(db,actor,"workflow",randomUUID(),"WORKFLOW_ACTIVATED",{version})
  return version
}

export async function startProject(db: PoolClient,actor: SessionAccount,input:{id:string;unitId:string;title:string}) {
  if(actor.userType!=="admin" && (actor.userType!=="author" || actor.unitId!==input.unitId)) throw new ForbiddenException()
  const {rows:[start]} = await db.query(`SELECT s.version,s.code,s.semantic FROM rms.workflow_step s
    JOIN rms.workflow_active a USING(tenant_id,version) WHERE s.initial`)
  if(!start) throw new ConflictException("Chưa có quy trình đang hoạt động.")
  await db.query(`INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status,status_semantic)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6)`,[input.id,input.unitId,input.title,actor.id,start.code,start.semantic])
  await db.query("INSERT INTO rms.workflow_instance VALUES(rms.current_tenant(),$1,$2,$3)",[input.id,start.version,start.code])
  await appendAudit(db,actor,"project",input.id,"PROJECT_CREATED",{step:start.code,templateVersion:start.version})
  return {version:start.version,step:start.code,rowVersion:0}
}

interface TransitionCommand {projectId:string;code:string;expectedVersion:number;reason?:string}
interface Source {owner_id:string;unit_id:string;status:string;status_semantic:string;row_version:number;version:number}
export async function transition(db:PoolClient,actor:SessionAccount,command:TransitionCommand,
  validateProposalContent?: (db:PoolClient,projectId:string)=>Promise<void>) {
  const {rows:[project]} = await db.query<Source>(`SELECT p.owner_id,p.unit_id,p.status,p.status_semantic,p.row_version,i.version
    FROM rms.research_project p JOIN rms.workflow_instance i ON (p.tenant_id,p.id)=(i.tenant_id,i.project_id)
    WHERE p.id=$1 FOR UPDATE OF p,i`,[command.projectId])
  if (!project || !(actor.userType==="admin" || project.owner_id===actor.id ||
      (actor.userType==="staff" && project.unit_id===actor.unitId))) throw new NotFoundException()
  if (project.row_version!==command.expectedVersion) throw new ConflictException("Hồ sơ đã được chuyển bước.")
  const {rows:[edge]} = await db.query(`SELECT e.*,e.roles::text[] AS allowed,s.semantic
    FROM rms.workflow_edge e JOIN rms.workflow_step s ON (e.tenant_id,e.version,e.to_step)=(s.tenant_id,s.version,s.code)
    WHERE e.version=$1 AND e.from_step=$2 AND e.code=$3`,[project.version,project.status,command.code])
  if (!edge) throw new ConflictException("Không có bước chuyển ở phiên bản đang dùng.")
  if (!edge.allowed.includes(actor.userType)) throw new ForbiddenException()
  const reason = command.reason?.trim()??""
  if ((edge.requires_comment || edge.guards.includes("requireComment")) && !reason) throw new BadRequestException("Cần nhập lý do.")
  if (edge.guards.includes("authorCancellableOnly") && actor.userType==="author" &&
      (project.owner_id!==actor.id || !["DRAFT","SUBMITTED"].includes(project.status_semantic))) throw new ForbiddenException()
  if (edge.guards.includes("validateProposalContent")) {
    if (!validateProposalContent) throw new ConflictException("Cần kiểm tra nội dung đề xuất trước khi chuyển.")
    await validateProposalContent(db,command.projectId)
  }
  const version = project.row_version+1
  await db.query("UPDATE rms.research_project SET status=$2,status_semantic=$3,row_version=$4 WHERE id=$1",[command.projectId,edge.to_step,edge.semantic,version])
  await db.query("UPDATE rms.workflow_instance SET current_step=$2 WHERE project_id=$1",[command.projectId,edge.to_step])
  const details = {transition:edge.code,from:project.status,to:edge.to_step,reason,version,templateVersion:project.version}
  const auditId = await appendAudit(db,actor,"project",command.projectId,"WORKFLOW_TRANSITION",details)
  await db.query(`INSERT INTO rms.workflow_history(tenant_id,project_id,revision,template_version,transition,from_step,to_step,actor_id,reason,audit_id)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9)`,[command.projectId,version,project.version,edge.code,project.status,edge.to_step,actor.id,reason,auditId])
  const eventId = randomUUID()
  await db.query(`INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6)`,[eventId,command.projectId,"PROJECT."+edge.semantic,edge.effects,auditId,{...details,ownerId:project.owner_id}])
  return {step:edge.to_step,semantic:edge.semantic,version,auditId,eventId}
}

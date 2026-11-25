import { BadRequestException,ForbiddenException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { allowedWidgets,layoutKey,layoutKeys,widgetsFor,type HomeRole } from "@rms/api-contracts/home-layout"
import type { Access } from "./access.js"

type Settings=operations["getHomeLayoutSettings"]["responses"][200]["content"]["application/json"]
type LayoutState=Pick<Settings,"widgets"|"source"|"revision">
type Update=operations["saveHomeLayoutSettings"]["requestBody"]["content"]["application/json"]

export function adminRole(access:Access,role:string):HomeRole {
  if(access.scope!=="tenant"||!access.canWrite)throw new ForbiddenException()
  if(!Object.hasOwn(layoutKeys,role))throw new BadRequestException("Vai trò không hợp lệ.")
  return role as HomeRole
}

export function layoutUpdate(role:HomeRole,body:unknown):Update {
  if(!body||typeof body!=="object"||Object.keys(body).some(k=>k!=="revision"&&k!=="widgets"))
    throw new BadRequestException("Cần phiên bản và danh sách thẻ.")
  const {revision,widgets}=body as Partial<Update>
  if(revision!==null&&(typeof revision!=="string"||!/^([a-f\d]{8})(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(revision)))
    throw new BadRequestException("Phiên bản bố cục không hợp lệ.")
  const allowed=allowedWidgets(role,true)
  if(!Array.isArray(widgets)||widgets.length>allowed.length||!widgets.every(w=>allowed.includes(w))||new Set(widgets).size!==widgets.length)
    throw new BadRequestException("Danh sách thẻ không hợp lệ cho vai trò.")
  return {revision,widgets}
}

export async function effectiveLayout(db:PoolClient,role:HomeRole):Promise<LayoutState>{
  const {rows:[row]}=await db.query(`SELECT revision,content,CASE WHEN tenant_id IS NULL THEN 'shared' ELSE 'tenant' END AS source
    FROM catalog.configuration WHERE canonical_key=$1 ORDER BY tenant_id NULLS LAST LIMIT 1`,[layoutKey(role).toLowerCase()])
  return {revision:row?.revision??null,source:row?.source??"default",widgets:widgetsFor(role,row?.content.toString("utf8")??null,true)}
}

export async function beforeLayoutWrite(db:PoolClient,key:string){
  const role=(Object.keys(layoutKeys) as HomeRole[]).find(role=>layoutKey(role).toLowerCase()===key)
  if(!role)return undefined
  // Shared edits and tenant overrides must agree on the inherited value at commit.
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",["catalog-layout:"+key])
  return {role,current:await effectiveLayout(db,role)}
}

export async function layoutSettings(db:PoolClient,role:HomeRole,skip:number):Promise<Settings>{
  const key=layoutKey(role).toLowerCase()
  await db.query("SELECT set_config('rms.home_layout_admin','on',true)")
  const current=await effectiveLayout(db,role)
  const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total FROM catalog.audit WHERE tenant_id=catalog.tenant() AND key=$1",[key])
  const {rows:history}=await db.query<Settings["history"][number]>(`SELECT id,actor_id AS "actorId",actor_email AS "actorEmail",
    occurred_at AS "occurredAt",action,layout_before AS before,layout_after AS after
    FROM catalog.audit WHERE tenant_id=catalog.tenant() AND key=$1 ORDER BY occurred_at DESC,id DESC LIMIT 10 OFFSET $2`,[key,skip])
  return {...current,total,history}
}

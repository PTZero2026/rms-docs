import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { appendAudit } from "../../audit/append.js"
import { offset } from "../../proposal/access.js"
import type { SessionAccount } from "../account.js"

type Profile=operations["getOwnProfile"]["responses"][200]["content"]["application/json"]
type Receipt=operations["lockAccount"]["responses"][200]["content"]["application/json"]
type ProfileChange=operations["saveOwnProfile"]["requestBody"]["content"]["application/json"]
const columns='id,email,full_name AS "fullName",phone,profile_revision AS revision,user_type AS "userType",is_active AS "isActive",deleted_at AS "deletedAt"'
const scope="($1='admin' OR ($1='staff' AND unit_id=$2::uuid))"

export function managementLock(db:PoolClient) {
  return db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text,3))")
}
function allowDirectory(actor:SessionAccount) {
  if(!actor.permissions.includes("users.manage"))throw new ForbiddenException()
}
export async function listAccounts(db:PoolClient,actor:SessionAccount,search:unknown,skip:unknown) {
  allowDirectory(actor)
  if(search!==undefined && (typeof search!=="string" || search.length>256))throw new BadRequestException()
  const values=[actor.userType,actor.unitId,search??""]
  const source=" FROM rms.account WHERE "+scope+" AND (strpos(lower(email),lower($3))>0 OR strpos(lower(full_name),lower($3))>0)"
  const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total"+source,values)
  const {rows:items}=await db.query<Profile>("SELECT "+columns+source+" ORDER BY email,id LIMIT 20 OFFSET $4",[...values,offset(skip)])
  return {items,total}
}
async function latestEvent(db:PoolClient,id:string):Promise<Receipt["event"]> {
  const {rows:[event]}=await db.query("SELECT id,action,occurred_at AS at,actor_id AS \"actorId\" FROM rms.audit_log WHERE target_type='account' AND target_id=$1 ORDER BY occurred_at DESC,id DESC LIMIT 1",[id])
  return event??null
}
export async function managed(db:PoolClient,actor:SessionAccount,id:string):Promise<Receipt> {
  allowDirectory(actor)
  const {rows:[account]}=await db.query<Profile>("SELECT "+columns+" FROM rms.account WHERE "+scope+" AND id=$3",[actor.userType,actor.unitId,id])
  if(!account)throw new NotFoundException()
  return {account,event:await latestEvent(db,id)}
}
export async function ownProfile(db:PoolClient,actor:SessionAccount) {
  const {rows:[profile]}=await db.query<Profile>("SELECT "+columns+" FROM rms.account WHERE id=$1",[actor.id])
  return profile
}
export async function saveProfile(db:PoolClient,actor:SessionAccount,input:ProfileChange) {
  if(!input || Object.keys(input).some(k=>!["fullName","phone","revision"].includes(k)) ||
    typeof input.fullName!=="string" || !input.fullName.trim() || input.fullName.length>160 ||
    typeof input.phone!=="string" || !/^[0-9+(). -]{0,32}$/.test(input.phone) || !Number.isSafeInteger(input.revision) || input.revision<0)throw new BadRequestException()
  const {rows:[profile]}=await db.query<Profile>("UPDATE rms.account SET full_name=$2,phone=$3,profile_revision=profile_revision+1 WHERE id=$1 AND profile_revision=$4 RETURNING "+columns,[actor.id,input.fullName.trim(),input.phone.trim(),input.revision])
  if(!profile)throw new ConflictException("Hồ sơ đã đổi. Vui lòng tải lại.")
  await appendAudit(db,actor,"account",actor.id,"PROFILE_UPDATED",{revision:profile.revision})
  return profile
}
type Operation="lock"|"unlock"|"deactivate"|"role"
export async function manageAccount(db:PoolClient,actor:SessionAccount,id:string,op:Operation,role?:SessionAccount["userType"]):Promise<Receipt> {
  if(actor.userType!=="admin" || !actor.permissions.includes("users.manage"))throw new ForbiddenException()
  if(actor.id===id && (op==="lock"||op==="deactivate"))throw new BadRequestException("Không thể tự khóa tài khoản của mình.")
  if(op==="role" && !["user","author","staff","admin"].includes(role??""))throw new BadRequestException()
  const {rows:[before]}=await db.query<Profile>("SELECT "+columns+" FROM rms.account WHERE id=$1 FOR UPDATE",[id])
  if(!before)throw new NotFoundException()
  if(before.deletedAt && op!=="deactivate")throw new ConflictException("Tài khoản đã ngừng hoạt động.")
  const active=op==="role"?before.isActive:op==="unlock",nextRole=op==="role"?role!:before.userType
  const deleted=op==="deactivate"
  if(before.isActive===active && before.userType===nextRole && !!before.deletedAt===deleted)return {account:before,event:await latestEvent(db,id)}
  if(before.isActive && before.userType==="admin" && (!active||nextRole!=="admin")) {
    const {rowCount}=await db.query("SELECT 1 FROM rms.account WHERE id<>$1 AND is_active AND deleted_at IS NULL AND user_type='admin' LIMIT 1",[id])
    if(!rowCount)throw new ConflictException("Phải còn tối thiểu một quản trị viên đang hoạt động.")
  }
  const {rows:[account]}=await db.query<Profile>(`UPDATE rms.account SET is_active=$2,user_type=$3,deleted_at=CASE WHEN $4 THEN now() ELSE NULL END WHERE id=$1 RETURNING ${columns}`,[id,active,nextRole,deleted])
  const action={lock:"ACCOUNT_LOCKED",unlock:"ACCOUNT_UNLOCKED",deactivate:"ADMIN_DELETE_USER",role:"ADMIN_CHANGE_USER_ROLE"}[op]
  await appendAudit(db,actor,"account",id,action,{before:{userType:before.userType,isActive:before.isActive},after:{userType:nextRole,isActive:active}})
  return {account,event:await latestEvent(db,id)}
}

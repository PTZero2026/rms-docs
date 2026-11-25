import {BadRequestException,ConflictException,ForbiddenException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import {appendAudit} from "../../audit/append.js"
import {managed} from "../lock-account/service.js"
import type {SessionAccount} from "../account.js"
export type Command=operations["precreateAccount"]["requestBody"]["content"]["application/json"]
const uuid=/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i
function validate(a:SessionAccount,cmd:Command){
  if(a.userType!=="admin"||!a.permissions.includes("users.manage"))throw new ForbiddenException()
  if(!cmd||!uuid.test(cmd.commandId)||!uuid.test(cmd.unitId)||typeof cmd.email!=="string"||cmd.email.length>254||!/^\S+@[^@\s]+\.[^@\s]+$/.test(cmd.email.trim())||
    typeof cmd.fullName!=="string"||!cmd.fullName.trim()||cmd.fullName.length>160||!["user","author","staff","admin"].includes(cmd.userType))throw new BadRequestException("Kiểm tra email, họ tên, đơn vị và vai trò.")
}
export async function reserveAccount(db:PoolClient,a:SessionAccount,cmd:Command){
  validate(a,cmd)
  const email=cmd.email.trim().toLowerCase(),name=cmd.fullName.trim()
  const prior=await db.query("SELECT * FROM rms.account_provision_request WHERE command_id=$1 FOR UPDATE",[cmd.commandId])
  if(prior.rowCount){
    const r=prior.rows[0]
    if(r.email!==email||r.full_name!==name||r.unit_id!==cmd.unitId||r.user_type!==cmd.userType||r.actor_id!==a.id)throw new ConflictException("Mã yêu cầu đã được dùng.")
    return {account:r.target_id?(await managed(db,a,r.target_id)).account:null}
  }
  if(!(await db.query("SELECT 1 FROM rms.unit WHERE id=$1",[cmd.unitId])).rowCount)throw new BadRequestException("Đơn vị không tồn tại.")
  if((await db.query("SELECT 1 FROM rms.account WHERE email=$1",[email])).rowCount)throw new ConflictException("Email đã tồn tại trong trường.")
  const r=await db.query(`INSERT INTO rms.account_provision_request(tenant_id,command_id,email,full_name,unit_id,user_type,actor_id)
    VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,[cmd.commandId,email,name,cmd.unitId,cmd.userType,a.id])
  if(!r.rowCount)throw new ConflictException("Email hoặc mã yêu cầu đã được giữ.")
  return {account:null}
}
export async function completeAccount(db:PoolClient,a:SessionAccount,cmd:Command,subject:string){
  const r=await reserveAccount(db,a,cmd)
  if(r.account)return r.account
  if(!uuid.test(subject))throw new ConflictException("IdP chưa trả danh tính hợp lệ.")
  const email=cmd.email.trim().toLowerCase(),name=cmd.fullName.trim()
  const {rows:[target]}=await db.query(`INSERT INTO rms.account(tenant_id,issuer,subject,email,full_name,unit_id,user_type)
    SELECT id,issuer,$1,$2,$3,$4,$5::rms.user_type FROM rms.tenant WHERE id=rms.current_tenant() AND enabled
    ON CONFLICT(tenant_id,subject) DO UPDATE SET full_name=EXCLUDED.full_name,unit_id=EXCLUDED.unit_id,user_type=EXCLUDED.user_type
    WHERE rms.account.email=EXCLUDED.email AND rms.account.is_active AND rms.account.deleted_at IS NULL AND rms.account.user_type='user' RETURNING id`,[subject,email,name,cmd.unitId,cmd.userType])
  if(!target)throw new ConflictException("Danh tính đã thay đổi. Kiểm tra yêu cầu cấp tài khoản.")
  await db.query("UPDATE rms.account_provision_request SET target_id=$2 WHERE command_id=$1",[cmd.commandId,target.id])
  await appendAudit(db,a,"account",target.id,"ADMIN_CREATE_USER",{commandId:cmd.commandId,userType:cmd.userType,unitId:cmd.unitId})
  return (await managed(db,a,target.id)).account
}

import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../account.js"
import {manageAccount} from "../lock-account/service.js"
import {appendAudit} from "../../audit/append.js"

type Application = operations["submitAuthorRequest"]["requestBody"]["content"]["application/json"]
type Entry = operations["submitAuthorRequest"]["responses"][200]["content"]["application/json"]
const read = `SELECT r.id,r.user_id AS "userId",a.email,r.application,r.status,r.admin_note AS "adminNote",
  r.reviewed_by AS "reviewedById",r.reviewed_at AS "reviewedAt",r.created_at AS "createdAt"
  FROM rms.author_request r JOIN rms.account a ON (a.tenant_id,a.id)=(r.tenant_id,r.user_id)`

function admin(actor:SessionAccount) {
  if(actor.userType!=="admin") throw new ForbiddenException()
}

export async function listRequests(db:PoolClient,actor:SessionAccount,queue:boolean) {
  if(queue) admin(actor)
  const where=queue?" WHERE r.status='PENDING' ORDER BY r.created_at,r.id":" WHERE r.user_id=$1 ORDER BY r.created_at DESC,r.id DESC"
  return (await db.query<Entry>(read+where+" LIMIT 50",queue?[]:[actor.id])).rows
}

function validUrl(value:unknown) {
  if(typeof value!=="string"||value.length>2048) return false
  try {
    const u = new URL(value)
    return u.protocol==="https:" && !u.username && !u.password
  } catch { return false }
}

function validate(data:Application) {
  const text=(v:unknown,max:number,required=false)=>typeof v==="string"&&v.length<=max&&(!required||!!v.trim())
  if(!data||typeof data!=="object"||Object.keys(data).some(k=>!["academicTitle","specialty","licenseNo","graduationYear","researchDirection","evidenceFileUrls"].includes(k))||
    !text(data.academicTitle,160,true)||!text(data.specialty,240,true)||
    data.licenseNo!==undefined&&!text(data.licenseNo,100)||data.researchDirection!==undefined&&!text(data.researchDirection,2000)||
    data.graduationYear!==undefined&&(!Number.isInteger(data.graduationYear)||data.graduationYear<1||data.graduationYear>Number(new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"Asia/Ho_Chi_Minh"}).format(new Date())))||
    !Array.isArray(data.evidenceFileUrls)||!data.evidenceFileUrls.length||data.evidenceFileUrls.length>10||
    !data.evidenceFileUrls.every(validUrl)||new Set(data.evidenceFileUrls).size!==data.evidenceFileUrls.length)
    throw new BadRequestException("Kiểm tra học hàm/học vị, chuyên môn, năm tốt nghiệp và đường dẫn HTTPS của minh chứng.")
}

export async function submitRequest(db:PoolClient,actor:SessionAccount,data:Application) {
  if(actor.userType!=="user") throw new ForbiddenException()
  validate(data)
  const inserted=await db.query("INSERT INTO rms.author_request(tenant_id,user_id,application) VALUES(rms.current_tenant(),$1,$2) ON CONFLICT DO NOTHING RETURNING id",[actor.id,data])
  const {rows:[request]}=await db.query<Entry>(read+" WHERE r.user_id=$1 AND r.status='PENDING' AND r.application=$2::jsonb",[actor.id,data])
  if(!request) throw new ConflictException("Đã có yêu cầu khác đang chờ duyệt.")
  if(inserted.rowCount) await appendAudit(db,actor,"author-request",request.id,"AUTHOR_REQUEST_SUBMITTED",{userId:actor.id})
  return request
}

export async function reviewRequest(db:PoolClient,actor:SessionAccount,id:string,approve:boolean,note:unknown) {
  admin(actor)
  if(typeof note!=="string"||note.length>2000||(!approve&&!note.trim())) throw new BadRequestException("Nhập lý do khi từ chối.")
  const entry=async()=> (await db.query<Entry>(read+" WHERE r.id=$1 FOR UPDATE OF r",[id])).rows[0]
  const request=await entry()
  if(!request) throw new NotFoundException()
  const status=approve?"APPROVED":"REJECTED"
  if(request.status!== "PENDING") {
    if(request.status===status&&request.reviewedById===actor.id&&request.adminNote===note.trim()) return request
    throw new ConflictException("Yêu cầu đã được giải quyết.")
  }
  if(approve) {
    const current=await db.query("SELECT user_type,is_active,deleted_at FROM rms.account WHERE id=$1 FOR UPDATE",[request.userId])
    const user=current.rows[0]
    if(!user?.is_active||user.deleted_at||user.user_type!=="user") throw new ConflictException("Tài khoản đã thay đổi từ khi nộp.")
    await manageAccount(db,actor,request.userId,"role","author")
  }
  await db.query("UPDATE rms.author_request SET status=$2,reviewed_at=now(),reviewed_by=$3,admin_note=$4 WHERE id=$1",[id,status,actor.id,note.trim()])
  await appendAudit(db,actor,"author-request",id,"AUTHOR_REQUEST_"+status,{userId:request.userId})
  return entry()
}

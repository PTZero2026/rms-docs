import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {offset} from "../proposal/access.js"

type Page=operations["listNotificationDeliveries"]["responses"][200]["content"]["application/json"]
type Retry=operations["resendNotificationDeliveries"]["requestBody"]["content"]["application/json"]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i

export async function listDeliveries(db:PoolClient,actor:SessionAccount,query:Record<string,unknown>):Promise<Page>{
  if(!actor.permissions.includes("notifications.send"))throw new ForbiddenException()
  const filter=query.filter??"all"
  if(filter!=="all"&&filter!=="failed"&&filter!=="reconcile")throw new BadRequestException()
  const result=await db.query<Page>(`WITH scoped AS MATERIALIZED (
    SELECT src.id,src.event,src.recipient,src.channel,src.status,src.attempts,src.revision,src.error,
      src.created_at AS "createdAt",coalesce(copy.title,src.title) AS title,d.template_missing AS "templateMissing"
    FROM rms.delivery_log_for($1) src JOIN rms.delivery d ON d.id=src.id AND d.tenant_id=rms.current_tenant()
    LEFT JOIN LATERAL rms.delivery_copy(d.id) copy ON true WHERE $2='all' OR src.status=$2
  ), page AS (SELECT * FROM scoped ORDER BY "createdAt" DESC,id LIMIT 20 OFFSET $3)
  SELECT count(*)::int AS total,coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY "createdAt" DESC,id) FROM page),'[]') AS items FROM scoped`,
    [actor.id,filter,offset(query.skip)])
  return result.rows[0]
}

export async function resendDeliveries(db:PoolClient,actor:SessionAccount,command:Retry){
  if(!actor.permissions.includes("notifications.send"))throw new ForbiddenException()
  const items=command?.items
  if(!Array.isArray(items)||items.length<1||items.length>20||items.some(item=>!item||typeof item.id!=="string"||!uuid.test(item.id)||
    !Number.isSafeInteger(item.revision)||item.revision<0||item.revision>2147483647)||new Set(items.map(i=>i.id.toLowerCase())).size!==items.length)
    throw new BadRequestException("Chọn từ 1 đến 20 lượt gửi lỗi hợp lệ.")
  for(const item of [...items].sort((a,b)=>a.id.toLowerCase().localeCompare(b.id.toLowerCase()))){
    const {rows:[result]}=await db.query("SELECT rms.resend_failed_delivery($1,$2,$3) AS accepted",[actor.id,item.id,item.revision])
    if(!result.accepted){
      if(!(await db.query("SELECT 1 FROM rms.delivery_log_for($1) WHERE id=$2",[actor.id,item.id])).rowCount)throw new NotFoundException()
      throw new ConflictException("Lượt gửi đã thay đổi hoặc cần đối soát.")
    }
  }
  return {count:items.length}
}

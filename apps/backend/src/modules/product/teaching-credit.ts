import {BadRequestException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {revokeSourceHours} from "../teaching-hour/revoke.js"

type Decision=operations["decideProduct"]["requestBody"]["content"]["application/json"]
type Shares=NonNullable<Decision["credits"]>
export async function productCredits(db:PoolClient,actor:SessionAccount,source:{id:string;authors:string[];revision:number},decision:Decision,enabled:boolean){
  if(decision.action==="reopen")await revokeSourceHours(db,actor,"product",source.id,source.revision,decision.reason.trim())
  if(decision.action!=="approve"||!enabled)return null
  const shares:Shares|undefined=decision.credits??(source.authors.length===1?[{accountId:source.authors[0],role:"CORRESPONDING_OR_FIRST",share:100}]:undefined)
  if(!Array.isArray(shares)||!shares.length||shares.length>source.authors.length||
    shares.some(c=>!c||!source.authors.includes(c.accountId)||!["CORRESPONDING_OR_FIRST","COAUTHOR"].includes(c.role)||
      !Number.isSafeInteger(c.share)||c.share<1||c.share>100)||
    new Set(shares.map(c=>c.accountId)).size!==shares.length||shares.filter(c=>c.role==="CORRESPONDING_OR_FIRST").length!==1||
    shares.reduce((sum,c)=>sum+c.share,0)!==100)
    throw new BadRequestException("Chọn tác giả chính hoặc liên hệ và xác nhận tổng tỷ lệ quy đổi bằng 100%.")
  return shares.map(({accountId,role,share})=>({accountId,role,share}))
}
export async function enqueueProductHours(db:PoolClient,id:string){
  await db.query(`INSERT INTO rms.hour_request(tenant_id,source_id,source_revision,unit_id,kind,category,source_date,recipient,role,share)
    SELECT o.tenant_id,o.id,o.revision,o.unit_id,'product',o.kind,(o.reviewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
      c."accountId",c.role,c.share FROM rms.research_output o CROSS JOIN LATERAL
      jsonb_to_recordset(o.approved_hour_shares) AS c("accountId" uuid,role text,share integer)
    WHERE o.id=$1 AND o.status='APPROVED' AND o.approved_hour_shares IS NOT NULL
    ON CONFLICT(tenant_id,kind,source_id,source_revision,recipient,role) DO NOTHING`,[id])
}

import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"

export async function notifyRecipients(db:PoolClient,eventType:string,targetId:string,auditId:string,recipientIds:string[],details:Record<string,unknown>={}){
  if(!recipientIds.length)return
  await db.query("INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload) VALUES(rms.current_tenant(),$1,$2,$3,ARRAY['notify'],$4,$5)",
    [randomUUID(),targetId,eventType,auditId,{...details,recipientIds:[...new Set(recipientIds)]}])
}
export async function unitOfficers(db:PoolClient,unit:string){
  const {rows}=await db.query<{id:string}>("SELECT id FROM rms.account WHERE unit_id=$1 AND user_type='staff' AND is_active AND deleted_at IS NULL",[unit])
  return rows.map(row=>row.id)
}

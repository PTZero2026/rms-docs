import {defaultRetryPolicy,validRetryPolicy,type RetryPolicy} from "@rms/api-contracts/notification-retry"
import { randomUUID } from "node:crypto"
import type { Pool } from "pg"
import { withTenant } from "../../db/tenant-transaction.js"

import type {SendSms} from "./sms.js"
export {smsGateway} from "./sms.js"

interface Mail { to:string; messageId:string; eventId:string; subject:string; text:string }
type SendMail = (mail:Mail)=>Promise<void>
type ReadPolicy=(tenant:string)=>Promise<RetryPolicy>
export function retryPolicyReader(origin:string,secret:string):ReadPolicy{
  const base=new URL(origin)
  if(base.protocol!=="https:"&&!(base.protocol==="http:"&&["127.0.0.1","localhost","[::1]"].includes(base.hostname)))throw Error("Invalid B01 origin")
  if(secret.length<32)throw Error("Missing notification worker credential")
  return async tenant=>{
    const url=new URL("/internal/notifications/"+encodeURIComponent(tenant)+"/retry-policy",base)
    const res=await fetch(url,{headers:{"X-RMS-Reminder-Service":secret},redirect:"error",signal:AbortSignal.timeout(5000)})
    if(!res.ok)throw Error("Notification retry policy unavailable")
    const value:unknown=await res.json()
    if(!validRetryPolicy(value))throw Error("Invalid notification retry policy")
    return value
  }
}

export async function deliverNext(pool:Pool,sendMail:SendMail,selectedTenant?:string,readPolicy?:ReadPolicy,sendSms?:SendSms) {
  const tenant = selectedTenant ?? (await pool.query("SELECT rms.next_delivery_tenant() AS id")).rows[0].id
  if (!tenant) return false
  const job = await withTenant(pool,tenant,async db=>{
    const {rows:[row]} = await db.query(`SELECT d.id,d.recipient_id,d.event_id,d.channel,d.status,d.attempts,a.is_active,a.deleted_at
      FROM rms.delivery d JOIN rms.account a ON (a.tenant_id,a.id)=(d.tenant_id,d.recipient_id)
      WHERE (d.status='ready' AND d.available_at<=now()) OR (d.status='leased' AND d.lease_until<=now())
      ORDER BY d.available_at,d.id LIMIT 1 FOR UPDATE OF d SKIP LOCKED`)
    if(!row) return null
    if (row.status==="leased" && row.channel!=="in_app") {
      await db.query("UPDATE rms.delivery SET status='reconcile',last_error='lease_expired',lease_id=NULL,lease_until=NULL WHERE id=$1",[row.id])
      return {done:true as const}
    }
    if (!row.is_active || row.deleted_at) {
      await db.query("UPDATE rms.delivery SET status='skipped',last_error='recipient_inactive' WHERE id=$1",[row.id])
      return {done:true as const}
    }
    if(row.channel==="in_app") {
      await db.query("INSERT INTO rms.notice(tenant_id,event_id,recipient_id) VALUES(rms.current_tenant(),$1,$2) ON CONFLICT DO NOTHING",[row.event_id,row.recipient_id])
      await db.query("UPDATE rms.delivery SET status='sent',attempts=attempts+1 WHERE id=$1",[row.id])
      return {done:true as const}
    }
    if(row.channel==="sms" && !sendSms){
      await db.query("UPDATE rms.delivery SET available_at=now()+interval '5 minutes',last_error='sms_gateway_unconfigured' WHERE id=$1",[row.id])
      return {done:true as const}
    }
    const lease = randomUUID()
    await db.query("UPDATE rms.delivery SET status='leased',attempts=attempts+1,lease_id=$2,lease_until=now()+interval '2 minutes' WHERE id=$1",[row.id,lease])
    return {done:false as const,id:row.id,eventId:row.event_id,channel:row.channel as "sms"|"smtp",attempt:row.attempts+1,lease}
  })
  if (!job) return false
  if (job.done) return true
  let policy:RetryPolicy=defaultRetryPolicy
  if(readPolicy){
    try{policy=await readPolicy(tenant)}catch{
      // No gateway call has started. Release this lease without counting a delivery attempt.
      await withTenant(pool,tenant,db=>db.query(`UPDATE rms.delivery SET status='ready',attempts=attempts-1,
        last_error='retry_policy_unavailable',lease_id=NULL,lease_until=NULL,available_at=now()+interval '30 seconds'
        WHERE id=$1 AND status='leased' AND lease_id=$2`,[job.id,job.lease]))
      return true
    }
  }
  const message=await withTenant(pool,tenant,async db=>{
    const {rows:[row]}=await db.query(`SELECT a.email,a.is_active,a.deleted_at,copy.title,copy.body,
      CASE WHEN d.channel='sms' THEN rms.sms_destination(d.id) END AS phone
      FROM rms.delivery d JOIN rms.account a ON (a.tenant_id,a.id)=(d.tenant_id,d.recipient_id)
      LEFT JOIN LATERAL rms.delivery_copy(d.id) copy ON true
      WHERE d.id=$1 AND d.lease_id=$2 AND d.status='leased' FOR UPDATE OF d`,[job.id,job.lease])
    if(!row)return null
    if(!row.is_active || row.deleted_at){
      await db.query("UPDATE rms.delivery SET status='skipped',last_error='recipient_inactive',lease_id=NULL,lease_until=NULL WHERE id=$1",[job.id])
      return null
    }
    if(job.channel==="sms" && !row.phone){
      await db.query("UPDATE rms.delivery SET status='skipped',last_error='sms_recipient_unavailable',lease_id=NULL,lease_until=NULL WHERE id=$1",[job.id])
      return null
    }
    return {to:job.channel==="sms"?row.phone:row.email,eventId:job.eventId,subject:(row.title??"Thông báo RMS").replace(/[\r\n]+/g," "),
      text:row.body??"Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.",messageId:"<"+job.id+"@rms.invalid>"}
  })
  if(!message)return true
  let status = "sent", reason: string|null=null
  if(job.channel==="sms"){
    const outcome=await sendSms?.({to:message.to,text:message.text,deliveryId:job.id}).catch(()=>"unknown") ?? "unknown"
    if(outcome!=="accepted"){
      reason="sms_"+outcome
      if(outcome==="unknown")status="reconcile"
      else if(outcome==="busy" && job.attempt<policy.maxAttempts)status="ready"
      else status="failed"
    }
  }else{
    try{
      await sendMail(message)
    }catch(error){
      // Once SMTP may have accepted DATA, only a human can reconcile the relay receipt.
      const e=error as {code?:string;responseCode?:number}
      const refused=e.code==="ECONNECTION" || e.code==="EDNS" || e.code==="ECONNREFUSED" || (e.responseCode??0)>=400
      reason=refused?"smtp_rejected":"smtp_unknown"
      status=refused?(job.attempt<policy.maxAttempts && (e.responseCode??0)<500?"ready":"failed"):"reconcile"
    }
  }
  await withTenant(pool,tenant,db=>db.query(`UPDATE rms.delivery SET status=$3,last_error=$4,lease_id=NULL,lease_until=NULL,
    available_at=now()+($5 * interval '1 second') WHERE id=$1 AND lease_id=$2 AND status='leased'`,
    [job.id,job.lease,status,reason,Math.min(900,2**(job.attempt-1)*policy.baseSeconds)]))
  return true
}

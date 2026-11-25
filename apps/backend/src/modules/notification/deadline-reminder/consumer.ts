import type { Pool } from "pg"
import type { operations } from "@rms/api-contracts"
import { scheduleTenant } from "./service.js"

type Window=operations["getProgressReminderWindow"]["responses"][200]["content"]["application/json"]
export async function scanDeadlines(pool:Pool,origin:string,secret:string,at=new Date()) {
  const base=new URL(origin)
  if (base.protocol!=="https:" && !(base.protocol==="http:"&&["127.0.0.1","localhost","[::1]"].includes(base.hostname))) throw Error("Invalid B01 origin")
  if(secret.length<32)throw Error("Missing reminder service credential")
  const tenants=await pool.query<{id:string}>("SELECT rms.reminder_tenants() AS id")
  let enqueued=0,missing=0,failed=0
  for(const {id} of tenants.rows){
    try{
      const url=new URL("/internal/reminders/"+id+"/window",base)
      const result=await fetch(url,{headers:{"X-RMS-Reminder-Service":secret},redirect:"error",signal:AbortSignal.timeout(5000)})
      if(result.status===404){missing++;continue}
      if(!result.ok)throw Error("Configuration unavailable")
      const config:Window=await result.json()
      if(!Number.isInteger(config.daysBefore)||config.daysBefore<0||config.daysBefore>365)throw Error("Invalid configuration")
      enqueued+=await scheduleTenant(pool,id,config.daysBefore,at)
    }catch{failed++;console.error("Deadline scan failed for tenant",id)}
  }
  return {enqueued,missing,failed}
}

import type {Pool} from "pg"
import {withTenant} from "../../../db/tenant-transaction.js"
import {validCalendar,type Calendar} from "@rms/api-contracts/teaching-calendar"
export async function processHours(pool:Pool,tenant:string,calendar:Calendar){
  if(!validCalendar(calendar))throw Error("Lịch kỳ bị trùng hoặc sai ngày.")
  return withTenant(pool,tenant,async db=>{
    const {rows:[row]}=await db.query<{count:number}>("SELECT rms.apply_teaching_hours($1::jsonb) AS count",[JSON.stringify(calendar)])
    return row.count
  })
}
export async function scanTeachingHours(pool:Pool,origin:string,secret:string){
  const base=new URL(origin)
  if(secret.length<32||base.protocol!=="https:"&&!(base.protocol==="http:"&&["127.0.0.1","localhost","[::1]"].includes(base.hostname)))throw Error("Invalid teaching worker configuration")
  let applied=0,failed=0
  const tenants=await pool.query<{id:string}>("SELECT rms.reminder_tenants() AS id")
  for(const {id} of tenants.rows){
    try{
      const r=await fetch(new URL("/internal/teaching-hours/"+id+"/calendar",base),{headers:{"X-RMS-Teaching-Service":secret},redirect:"error",signal:AbortSignal.timeout(5000)})
      if(r.status===404)continue
      if(!r.ok)throw Error("B01 unavailable")
      applied+=await processHours(pool,id,await r.json())
    }catch{failed++;console.error("Teaching hours scan failed for tenant",id)}
  }
  return {applied,failed}
}

import type {Pool} from "pg"
import {withTenant} from "../../db/tenant-transaction.js"

export async function scanExpiredCalls(pool:Pool) {
  const tenants=await pool.query<{id:string}>("SELECT rms.reminder_tenants() AS id")
  let closed=0
  for(const {id} of tenants.rows){
    try{
      closed+=await withTenant(pool,id,async db=>{
        const result=await db.query<{count:number}>("SELECT rms.close_expired_calls() AS count")
        return result.rows[0].count
      })
    }catch(error){
      console.error("Call expiry scan failed for tenant",id,error instanceof Error?error.name:"Database error")
    }
  }
  return closed
}

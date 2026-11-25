import type { Pool } from "pg"
import { withTenant } from "../../../db/tenant-transaction.js"

export function scheduleTenant(pool:Pool,tenant:string,days:number,at=new Date()):Promise<number> {
  return withTenant(pool,tenant,async db=>{
    const {rows:[result]}=await db.query<{count:number}>("SELECT rms.enqueue_progress_reminders($1,$2) AS count",[at,days])
    return result.count
  })
}

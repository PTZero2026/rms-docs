import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { ensureIntakeGraph } from "./ensure-intake-graph.mjs"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable test database required")
const [operator,author]=process.argv.slice(2)
const pool=new Pool({user:"rms_test_client"})
try {
  await withTenant(pool,"00000000-0000-4000-8000-"+"1".padStart(12,"0"),async db=>{
    const unit=randomUUID()
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa Khoa học')",[unit])
    const {rows:[identity]}=await db.query("UPDATE rms.account SET user_type='admin',unit_id=$2 WHERE id=$1 RETURNING email,subject",[operator,unit])
    await ensureIntakeGraph(db,await resolveAccount(db,identity))
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[operator])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[author,unit])
  })
}finally{await pool.end()}

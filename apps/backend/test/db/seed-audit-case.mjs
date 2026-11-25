import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { ensureIntakeGraph } from "./ensure-intake-graph.mjs"
import { startProject,transition } from "../../dist/modules/workflow/kernel.js"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable test database required")
const [operator,viewer]=process.argv.slice(2)
const pool=new Pool({user:"rms_test_client"})
const unit=randomUUID(),other=randomUUID(),id=randomUUID()
try {
  await withTenant(pool,"00000000-0000-4000-8000-"+"1".padStart(12,"0"),async db=>{
    const who=async target=>{
      const {rows:[identity]}=await db.query("SELECT email,subject FROM rms.account WHERE id=$1",[target])
      return resolveAccount(db,identity)
    }
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa Nghiên cứu'),(rms.current_tenant(),$2,'Khoa mới')",[unit,other])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='admin' WHERE id=$2",[unit,viewer])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,operator])
    const actor=await who(viewer)
    await ensureIntakeGraph(db,actor)
    await startProject(db,actor,{id,title:"Đề tài theo dõi chất lượng nước",unitId:unit})
    await transition(db,await who(operator),{projectId:id,code:"cancel-draft",expectedVersion:0,reason:"Đã đối chiếu biên bản."})
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[viewer])
  })
  process.stdout.write(JSON.stringify({id,other}))
} finally {await pool.end()}

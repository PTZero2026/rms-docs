import { Pool } from "pg"
import { randomUUID } from "node:crypto"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { startProject } from "../../dist/modules/workflow/kernel.js"
import { assignProject } from "../../dist/modules/progress/service.js"
import { ensureIntakeGraph } from "./ensure-intake-graph.mjs"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable cluster required")
const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-"+String(2).padStart(12,"0")
const [staff,pi]=process.argv.slice(2),unit=randomUUID()
const account=async(db,id)=>resolveAccount(db,(await db.query("SELECT subject,email FROM rms.account WHERE id=$1",[id])).rows[0])
try{
  const ids=await withTenant(pool,tenant,async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa tài chính')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin',unit_id=$1 WHERE id=$2",[unit,staff])
    await ensureIntakeGraph(db,await account(db,staff))
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[staff])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$1 WHERE id=$2",[unit,pi])
    const operator=await account(db,staff),author=await account(db,pi),projects=[]
    for(const budget of [100000000,300000000]){
      const id=randomUUID(),file=randomUUID()
      await startProject(db,author,{id,unitId:unit,title:"Đề tài ngân sách "+budget})
      await db.query("UPDATE rms.research_project SET status='APPROVED',status_semantic='APPROVED' WHERE id=$1",[id])
      await db.query("UPDATE rms.workflow_instance SET current_step='APPROVED' WHERE project_id=$1",[id])
      await db.query("INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at) VALUES(rms.current_tenant(),$1,$2,0,$3,'Quyet-dinh.pdf','application/pdf',5,repeat('a',64),now(),now())",[file,id,staff])
      await assignProject(db,operator,id,{reference:"QĐ-18",signed:"2026-10-01",effective:"2026-10-02",start:"2026-11-01",end:"2027-10-31",budget,note:"",commitments:{ARTICLE:1},fileId:file})
      projects.push(id)
    }
    return projects
  })
  process.stdout.write(JSON.stringify(ids))
}finally{await pool.end()}

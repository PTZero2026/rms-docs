import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph,startProject } from "../../dist/modules/workflow/kernel.js"
import { assignProject,progressDetail,createPeriod,submitPeriod,reviewPeriod,changeActivity } from "../../dist/modules/progress/service.js"

const pool=new Pool({user:"rms_test_client"})
after(()=>pool.end())
const tn=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const as=(who,fn,n=21)=>withTenant(pool,tn(n),async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
const code=n=>e=>e.getStatus?.()===n
test("assignment, periods and report revisions require current project authority, evidence and inclusive local due dates",async()=>{
  const unit=randomUUID(),ids=[]
  await as("op",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa tiến độ')",[unit])
    await db.query("UPDATE rms.account SET unit_id=$2,user_type='admin' WHERE id=$1",[a.id,unit])
  })
  await as("op",async(db,a)=>{
    await activateGraph(db,a,defaultWorkflow(),0)
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[a.id])
  })
  await as("pi",async(db,a)=>db.query("UPDATE rms.account SET unit_id=$2,user_type='author' WHERE id=$1",[a.id,unit]))
  await as("pi",async(db,a)=>{
    for(const title of ["Đề tài A","Đề tài B"]){
      const id=randomUUID(),file=randomUUID()
      await startProject(db,a,{id,unitId:unit,title})
      // Prior F03 decision and promoted attachment are independent fixture inputs.
      await db.query("UPDATE rms.research_project SET status='APPROVED',status_semantic='APPROVED' WHERE id=$1",[id])
      await db.query("UPDATE rms.workflow_instance SET current_step='APPROVED' WHERE project_id=$1",[id])
      await db.query("INSERT INTO rms.proposal_document(tenant_id,project_id,form_snapshot,months,budget) VALUES(rms.current_tenant(),$1,'{}',12,50000000)",[id])
      await db.query(`INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at)
        VALUES(rms.current_tenant(),$1,$2,0,$3,'QD.pdf','application/pdf',100,repeat('a',64),now(),now())`,[file,id,a.id])
      ids.push({id,file})
    }
  })
  const now=new Date("2026-11-24T08:00:00Z"),deadline=new Date("2026-12-20T16:59:59.999Z"),late=new Date("2026-12-20T17:00:00.999Z")
  const input={reference:"QD-09",signed:"2026-11-01",effective:"2026-11-01",start:"2026-12-01",end:"2027-11-30",budget:50000000,note:"",commitments:{ARTICLE:1},fileId:ids[0].file}
  const assign=(id,data)=>as("op",(db,a)=>assignProject(db,a,id,data,now))
  for(const [bad,msg] of [[{reference:""},"quyết định"],[{budget:0},"Kinh phí"],[{fileId:null},"Tệp"],[{fileId:ids[1].file},"Tệp"],[{budget:60000000},"lý do"]])
    await assert.rejects(assign(ids[0].id,{...input,...bad}),e=>e.message.toLowerCase().includes(msg.toLowerCase()))
  assert.equal((await as("pi",(db,a)=>progressDetail(db,a,ids[0].id))).status,"APPROVED")
  await assert.rejects(as("pi",(db,a)=>assignProject(db,a,ids[0].id,input,now)),code(403))
  await as("op",db=>db.query("UPDATE rms.proposal_document SET promised_products=$2 WHERE project_id=$1",[ids[1].id,{BASIN_MAP:2}]))
  await assert.rejects(assign(ids[0].id,{...input,commitments:{BASIN_MAP:1}}),code(400))
  for(const p of ids){
    const accepted=await as("op",(db,a)=>assignProject(db,a,p.id,{...input,commitments:{BASIN_MAP:1},fileId:p.file},now,p===ids[0]?["BASIN_MAP"]:["ARTICLE"]))
    assert.equal(accepted.assignment.commitments.BASIN_MAP,p===ids[0]?1:2)
    assert.equal(accepted.status,"IN_PROGRESS")
    assert.equal(accepted.assignment.budget,input.budget)
    const schedule=()=>as("op",(db,a)=>createPeriod(db,a,p.id,{period:1,dueDate:"2026-12-20"}))
    const races=await Promise.allSettled([schedule(),schedule()])
    assert.equal(races.filter(r=>r.status==="fulfilled").length,1)
    assert.equal(races.find(r=>r.status==="rejected").reason.getStatus(),409)
    const source=await as("pi",(db,a)=>progressDetail(db,a,p.id))
    const period=source.periods[0]
    const submit=(date,version=0)=>as("pi",(db,a)=>submitPeriod(db,a,p.id,period.id,{revision:version,content:"Đã hoàn tất khảo sát.",fileId:p.file},date))
    const review=(action,revision,reason)=>as("op",(db,a)=>reviewPeriod(db,a,p.id,period.id,{action,revision,reason}))
    const pause=action=>as("op",(db,a)=>changeActivity(db,a,p.id,{action,reason:"Quyết định điều chỉnh tiến độ"}))
    await pause("suspend");await assert.rejects(submit(deadline),code(409));await pause("resume")
    const first=await submit(deadline)
    assert.equal(first.status,"SUBMITTED");assert.equal(first.late,false)
    await assert.rejects(review("return",first.revision," "),code(400))
    const returned=await review("return",first.revision,"Cần bổ sung bảng số liệu.")
    const second=await submit(late,returned.revision)
    assert.equal(second.late,true);assert.equal(second.revision,3)
    const passed=await review("pass",second.revision,"")
    await assert.rejects(submit(late,passed.revision),code(409))
    assert.equal((await review("reopen",passed.revision,"Xác minh bảng số liệu.")).status,"REVISION_REQUESTED")
    await assert.rejects(as("pi",(db,a)=>progressDetail(db,a,p.id),22),code(404))
  }
})

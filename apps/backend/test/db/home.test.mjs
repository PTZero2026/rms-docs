import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { returnedWork,openWork } from "../../dist/modules/home/open-work-item/service.js"

const pool=new Pool({user:"rms_test_client"})
after(()=>pool.end())
const tn=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const as=(who,fn,n=17)=>withTenant(pool,tn(n),async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("home layout preserves tenant order, limits counters to the current unit and does not write audit",async()=>{
  const {dashboard,widgetsFor}=await import("../../dist/modules/home/overview.js")
  const unit=randomUUID(),other=randomUUID()
  await as("home-bo",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa A'),(rms.current_tenant(),$2,'Khoa B')",[unit,other])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,a.id])
    for(const target of [unit,other])await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,status_semantic) VALUES(rms.current_tenant(),$1,$2,'Hồ sơ chờ','SUBMITTED')",[randomUUID(),target])
  })
  await as("home-bo",async(db,a)=>{
    const layout=widgetsFor(a.userType,"activity,projects,teaching,tasks,activity",false)
    assert.deepEqual(layout,["activity","projects","tasks"])
    const before=await db.query("SELECT count(*) FROM rms.audit_log")
    const data=await dashboard(db,a,layout,[])
    assert.equal(data.counters.find(c=>c.code==="submitted").value,1)
    assert.deepEqual(data.notices,[])
    assert.deepEqual((await db.query("SELECT count(*) FROM rms.audit_log")).rows,before.rows)
    assert.deepEqual(widgetsFor("user","projects,teaching,shortcuts",false),["shortcuts"])
  })
})
test("home uses current source scope and Vietnam date before counts or opening a returned proposal",async()=>{
  const ids=[]
  const owner=await as("homepi",async(db,a)=>{
    const unit=randomUUID()
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[unit])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit])
    for(const [index,end] of ["2026-11-20","2026-11-21","2026-11-22"].entries()){
      const c=randomUUID(),p=randomUUID()
      await db.query(`INSERT INTO rms.proposal_call(tenant_id,id,code,name,start_date,end_date,status)
        VALUES(rms.current_tenant(),$1,$2,'Kỳ thử','2026-11-01',$3,'OPEN')`,[c,"HOME-"+index,end])
      await db.query(`INSERT INTO rms.research_project(tenant_id,id,call_id,unit_id,owner_id,title,status,status_semantic)
        VALUES(rms.current_tenant(),$1,$2,$3,$4,'Điều tra nguồn nước','SỬA HỒ SƠ','DRAFT')`,[p,c,unit,a.id])
      await db.query("INSERT INTO rms.proposal_document(tenant_id,project_id,form_snapshot,return_reason) VALUES(rms.current_tenant(),$1,'{}','Bổ sung phụ lục')",[p])
      ids.push(p)
    }
    return a.id
  })
  const now=new Date("2026-11-20T17:00:00Z")
  const before=await as("homepi",db=>db.query("SELECT count(*) FROM rms.audit_log"))
  const all=await as("homepi",(db,a)=>returnedWork(db,a,{},now))
  assert.deepEqual(all.items.map(i=>i.id),ids)
  assert.deepEqual([all.total,all.overdue],[3,1])
  const filtered=await as("homepi",(db,a)=>returnedWork(db,a,{group:"overdue"},now))
  assert.deepEqual(filtered.items.map(i=>i.id),[ids[0]])
  assert.equal((await as("homepi",(db,a)=>openWork(db,a,ids[0],now))).id,ids[0])
  const after=await as("homepi",db=>db.query("SELECT count(*) FROM rms.audit_log"))
  assert.equal(before.rows[0].count,after.rows[0].count)
  for(const [who,n] of [["other",17],["homepi",18]]){
    assert.equal((await as(who,(db,a)=>returnedWork(db,a,{},now),n)).total,0)
    await assert.rejects(as(who,(db,a)=>openWork(db,a,ids[0],now),n),e=>e.getStatus()===404)
  }
  await as("homepi",db=>db.query("UPDATE rms.account SET user_type='user' WHERE id=$1",[owner]))
  await assert.rejects(as("homepi",(db,a)=>openWork(db,a,ids[0],now)),e=>e.getStatus()===404)
  assert.equal((await as("homepi",(db,a)=>returnedWork(db,a,{},now))).total,0)
})

test("two reporting periods share one project link but keep separate dates, recipients and source ids",async()=>{
  const project=randomUUID(),unit=randomUUID(),periods=[]
  await as("period-owner",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Thủy văn')",[unit])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,title,status_semantic) VALUES(rms.current_tenant(),$1,$2,$3,'Dòng chảy','IN_PROGRESS')",[project,unit,a.id])
    for(const [i,day] of ["2026-11-18","2026-11-21","2026-11-28"].entries()){
      const id=randomUUID()
      await db.query("INSERT INTO rms.progress_period(tenant_id,id,project_id,period,due_date) VALUES(rms.current_tenant(),$1,$2,$3,$4)",[id,project,i+2,day])
      periods.push(id)
    }
  })
  const now=new Date("2026-11-20T17:00:00Z")
  const all=await as("period-owner",(db,a)=>returnedWork(db,a,{},now))
  assert.deepEqual(all.items.map(w=>[w.id,w.targetId,w.feature]),periods.map(id=>[id,project,"F04"]))
  const overdue=await as("period-owner",(db,a)=>returnedWork(db,a,{group:"overdue"},now))
  assert.equal(overdue.overdue,1);assert.equal(overdue.items[0].id,periods[0])
  assert.equal((await as("period-owner",(db,a)=>openWork(db,a,periods[0],now))).targetId,project)
  await assert.rejects(as("other",(db,a)=>openWork(db,a,periods[0],now)),e=>e.getStatus()===404)
})

test("staff review tasks follow the current unit and disappear after intake or progress review",async()=>{
  const unit=randomUUID(),other=randomUUID(),proposal=randomUUID(),project=randomUUID(),call=randomUUID()
  const owner=await as("intake-author",async(_db,a)=>a.id)
  await as("intake-desk",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Tiếp nhận'),(rms.current_tenant(),$2,'Đơn vị mới')",[unit,other])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,a.id])
    await db.query("INSERT INTO rms.proposal_call(tenant_id,id,code,name,start_date,end_date,status) VALUES(rms.current_tenant(),$1,'B06-STAFF','Kỳ tiếp nhận',current_date,current_date,'OPEN')",[call])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,call_id,title,status_semantic) VALUES(rms.current_tenant(),$1,$2,$3,$4,'Đề xuất thử','SUBMITTED'),(rms.current_tenant(),$5,$2,$3,$4,'Đề tài thực hiện','IN_PROGRESS')",[proposal,unit,owner,call,project])
    await db.query("INSERT INTO rms.proposal_document(tenant_id,project_id,form_snapshot) VALUES(rms.current_tenant(),$1,'{}')",[proposal])
    await db.query("INSERT INTO rms.progress_period(tenant_id,project_id,period,due_date,status) VALUES(rms.current_tenant(),$1,1,current_date-3,'SUBMITTED')",[project])
  })
  const tasks=await as("intake-desk",(db,a)=>returnedWork(db,a,{}))
  assert.deepEqual(tasks.items.map(i=>i.targetId).sort(),[proposal,project].sort())
  assert.equal(tasks.overdue,0,"the author's submission date is not the officer's review deadline")
  await as("intake-desk",(db,a)=>db.query("UPDATE rms.account SET unit_id=$1 WHERE id=$2",[other,a.id]))
  for(const i of tasks.items)await assert.rejects(as("intake-desk",(db,a)=>openWork(db,a,i.id)),e=>e.getStatus()===404)
  await as("intake-desk",async(db,a)=>{
    await db.query("UPDATE rms.account SET unit_id=$1 WHERE id=$2",[unit,a.id])
    await db.query("UPDATE rms.proposal_document SET finalized_at=now(),finalized_by=$2 WHERE project_id=$1",[proposal,a.id])
    await db.query("UPDATE rms.progress_period SET status='PASSED' WHERE project_id=$1",[project])
  })
  assert.equal((await as("intake-desk",(db,a)=>returnedWork(db,a,{}))).total,0)
  const {dashboard}=await import("../../dist/modules/home/overview.js")
  const summary=await as("intake-desk",(db,a)=>dashboard(db,a,["projects"],[]))
  assert.equal(summary.counters.find(r=>r.code==="submitted").value,0)

})

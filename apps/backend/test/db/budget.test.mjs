import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph,startProject } from "../../dist/modules/workflow/kernel.js"
import { allocate,budgetDetail,saveExpense,voidExpense,reconcile,settle } from "../../dist/modules/budget/service.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000026"
after(()=>pool.end())
const as=(who,fn,scope=tenant)=>withTenant(pool,scope,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
const status=n=>e=>e.getStatus?.()===n
test("budget takes the fee cap, atomically records expenses, lists settlement blockers and closes once",async()=>{
  const unit=randomUUID(),policy={rate:"5",cap:"10000000"}
  await as("acct",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa thử')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin',unit_id=$2 WHERE id=$1",[a.id,unit])
  })
  await as("acct",async(db,a)=>{
    await activateGraph(db,a,defaultWorkflow(),0)
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[a.id])
  })
  await as("pi",(db,a)=>db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit]))
  const projects=[]
  for(const amount of ["100000000","300000000"]){
    const id=randomUUID(),file=randomUUID()
    await as("pi",async(db,a)=>{
      await startProject(db,a,{id,unitId:unit,title:"Kinh phí"})
      await db.query("UPDATE rms.research_project SET status='IN_PROGRESS',status_semantic='IN_PROGRESS' WHERE id=$1",[id])
      await db.query("UPDATE rms.workflow_instance SET current_step='IN_PROGRESS' WHERE project_id=$1",[id])
      await db.query("INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at) VALUES(rms.current_tenant(),$1,$2,0,$3,'file.pdf','application/pdf',5,repeat('a',64),now(),now())",[file,id,a.id])
      await db.query("INSERT INTO rms.project_assignment(tenant_id,project_id,reference,signed,effective,starts,ends,budget,note,commitments,file_id) VALUES(rms.current_tenant(),$1,'QĐ',current_date,current_date,current_date,current_date,$2,'','{}',$3)",[id,amount,file])
    })
    const input={amount,override:null,note:""}
    await assert.rejects(as("pi",(db,a)=>allocate(db,a,id,input,policy)),status(403))
    const results=await Promise.allSettled([1,2].map(()=>as("acct",(db,a)=>allocate(db,a,id,input,policy))))
    const success=results.find(r=>r.status==="fulfilled").value
    assert.equal(results.filter(r=>r.status==="fulfilled").length,1)
    assert.equal(success.allocation.fee,projects.length?"10000000":"5000000")
    assert.equal(success.balance,projects.length?"290000000":"95000000")
    projects.push({id,file})
  }
  const [{id,file},{id:manual,file:otherFile}]=projects
  const input={amount:"93000000",date:"2026-11-23",description:"Số liệu trạm đo",files:[file],revision:0}
  const write=(expense,body,project=id)=>as("pi",(db,a)=>saveExpense(db,a,project,expense,body))
  const first=randomUUID(),second=randomUUID()
  await assert.rejects(write(first,{...input,files:[otherFile]}),status(400))
  await assert.rejects(write(first,{...input,amount:"0"}),status(400))
  await assert.rejects(write(first,{...input,date:"2026-02-30"}),status(400))
  assert.equal((await write(first,input)).balance,"2000000")
  assert.equal((await write(second,{...input,amount:"2000000",files:[]})).balance,"0")
  assert.equal((await write(second,{...input,revision:1,amount:"3000000"})).balance,"-1000000")
  await assert.rejects(write(second,{...input,revision:1,amount:"4000000"}),status(409))
  await assert.rejects(as("acct",(db,a)=>saveExpense(db,a,id,randomUUID(),input)),status(403))
  await assert.rejects(as("pi",(db,a)=>budgetDetail(db,a,id),"00000000-0000-4000-8000-000000000025"),status(404))
  const mark=(expense,amount,reference,revision)=>as("acct",(db,a)=>reconcile(db,a,id,expense,{amount,reference,revision},true))
  const close=(project,mode,manualReviewed=true,who="acct")=>as(who,(db,a)=>settle(db,a,project,{manualReviewed},mode))
  for(const p of projects)await as("acct",async db=>{
    await db.query("UPDATE rms.research_project SET status='PASSED',status_semantic='PASSED' WHERE id=$1",[p.id])
    await db.query("UPDATE rms.workflow_instance SET current_step='PASSED' WHERE project_id=$1",[p.id])
  })
  await assert.rejects(close(manual,false,false),status(400))
  await assert.rejects(close(manual,false,true,"pi"),status(403))
  assert.equal((await close(manual,false)).status,"COMPLETED")
  const blockers=async(states)=>assert.rejects(close(id,true),e=>states.every(s=>e.message.includes(s)))
  await blockers(["UNRECONCILED",first,second])
  await mark(first,"1","BANK-1",1)
  await blockers(["MISMATCHED","UNRECONCILED",first,second])
  await mark(second,"3000000","BANK-2",2)
  await blockers(["MISMATCHED",first])
  await mark(first,"93000000","BANK-1",2)
  const ends=await Promise.allSettled([close(id,true),close(id,true)])
  assert.equal(ends.filter(r=>r.status==="fulfilled").length,1)
  await assert.rejects(write(first,{...input,revision:3}),status(409))
  await assert.rejects(as("pi",(db,a)=>voidExpense(db,a,id,first,{revision:3,reason:"Kiểm tra"})),status(409))
  const result=await as("acct",db=>db.query("SELECT count(*)::int AS n FROM rms.outbox WHERE target_id=$1 AND event_type='PROJECT.COMPLETED'",[id]))
  assert.equal(result.rows[0].n,1)
})

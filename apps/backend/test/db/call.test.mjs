import { randomUUID } from "node:crypto"
import assert from "node:assert/strict"
import { after,test } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { listCalls,saveCall,changeCall } from "../../dist/modules/call/service.js"
const pool=new Pool({user:"rms_test_client"})
after(()=>pool.end())
const tenant=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const time=new Date("2026-11-30T16:59:59.999Z"),later=new Date("2026-11-30T17:00:00Z")
test("opening rechecks field and criteria independently; first and last instants use the Vietnam business day",async()=>{
  const run=(who,work,n=11)=>withTenant(pool,tenant(n),async db=>work(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
  const field=randomUUID(),template=randomUUID(),criteria=randomUUID()
  await run("operator",async(db,a)=>{
    await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[a.id])
    for(const [id,kind] of [[field,"field"],[template,"form"],[criteria,"criteria"]]){
      await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name) VALUES(rms.current_tenant(),$1,$2,$2)",[id,kind])
    }
  })
  await run("author",(db,a)=>db.query("UPDATE rms.account SET user_type='author' WHERE id=$1",[a.id]))
  const payload={code:"KG-T11",name:"Kỳ cơ sở",startDate:"2026-11-01",endDate:"2026-11-30",fieldIds:[field],templateId:template,criteriaId:criteria}
  const create=body=>run("operator",(db,a)=>saveCall(db,a,body))
  await assert.rejects(create({...payload,endDate:"2026-10-01"}),e=>e.getStatus()===400)
  const row=await create(payload)
  assert.equal(row.status,"DRAFT")
  await assert.rejects(create({...payload,code:"kg-t11"}),e=>e.getStatus()===409)
  const list=(t,group="receiving")=>run("author",(db,a)=>listCalls(db,a,{search:"kg-t11",group},t))
  assert.equal((await list(time,"all")).total,0)
  for(const ref of [field,criteria]){
    await run("operator",db=>db.query("UPDATE rms.intake_reference SET active=false WHERE id=$1",[ref]))
    await assert.rejects(run("operator",(db,a)=>changeCall(db,a,row.id,{action:"open",revision:row.revision},time)),e=>e.getStatus()===409)
    await run("operator",db=>db.query("UPDATE rms.intake_reference SET active=true WHERE id=$1",[ref]))
  }
  const opened=await run("operator",(db,a)=>changeCall(db,a,row.id,{action:"open",revision:row.revision},time))
  assert.equal(opened.status,"OPEN")
  assert.equal((await list(time)).total,1)
  assert.equal((await list(later)).total,0)
  assert.equal((await list(new Date("2026-10-31T16:59:59Z"))).total,0)
  assert.equal((await run("operator",(db,a)=>listCalls(db,a,{group:"all"},time),12)).total,0)
  await assert.rejects(run("author",(db,a)=>changeCall(db,a,row.id,{action:"close",revision:opened.revision},time)),e=>e.getStatus()===403)
  const perform=(action,revision,fields={})=>run("operator",(db,a)=>changeCall(db,a,row.id,{action,revision,...fields},later))
  const closed=await perform("close",opened.revision)
  await assert.rejects(perform("extend",closed.revision,{endDate:"2026-12-05",reason:"  "}),e=>e.getStatus()===400)
  const extended=await perform("extend",closed.revision,{endDate:"2026-12-05",reason:"Gia hạn theo lịch của khoa."})
  assert.equal(extended.receiving,true)
  assert.equal(extended.criteriaId,opened.criteriaId)
  await assert.rejects(perform("cancel",extended.revision),e=>e.getStatus()===400)
  const cancelled=await perform("cancel",extended.revision,{reason:"Dừng đợt chưa có đề xuất."})
  assert.equal(cancelled.status,"CANCELLED")
  await assert.rejects(perform("extend",cancelled.revision,{endDate:"2026-12-10",reason:"Yêu cầu mới."}),e=>e.getStatus()===400)
  const {rows}=await run("operator",db=>db.query("SELECT action,details->>'reason' AS reason FROM rms.audit_log WHERE target_id=$1 AND action IN ('CALL_CANCELLED','CALL_EXTENDED') ORDER BY action",[row.id]))
  assert.deepEqual(rows,[{action:"CALL_CANCELLED",reason:"Dừng đợt chưa có đề xuất."},{action:"CALL_EXTENDED",reason:"Gia hạn theo lịch của khoa."}])
})

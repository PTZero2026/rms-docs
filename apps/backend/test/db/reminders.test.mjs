import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { after,test } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { deliverNext } from "../../dist/modules/notification/worker.js"
import { scheduleTenant } from "../../dist/modules/notification/deadline-reminder/service.js"

const app=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
const tenant="00000000-0000-4000-8000-000000000023",other=tenant.slice(0,-1)+"4"
after(()=>Promise.all([app.end(),worker.end()]))
test("N-day reminder survives concurrent scans, an SMTP retry and Vietnamese midnight",async()=>{
  const project=randomUUID(),period=randomUUID(),unit=randomUUID()
  const owner=await withTenant(app,tenant,async db=>{
    const account=await resolveAccount(db,{subject:"reminder-pi",email:"pi@example.invalid"})
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[unit])
    for(const [id,state,status] of [[project,"IN_PROGRESS","PENDING_SUBMISSION"],[randomUUID(),"SUSPENDED","PENDING_SUBMISSION"],[randomUUID(),"IN_PROGRESS","PASSED"]]){
      await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status_semantic,status) VALUES(rms.current_tenant(),$1,$2,'Hồ sơ',$3,$4::text::rms.project_semantic,$4)",[id,unit,account.id,state])
      await db.query("INSERT INTO rms.progress_period(tenant_id,id,project_id,period,due_date,status) VALUES(rms.current_tenant(),$1,$2,1,'2026-12-10',$3)",[id===project?period:randomUUID(),id,status])
    }
    return account.id
  })
  const at=(time,t=tenant)=>scheduleTenant(worker,t,7,new Date(time))
  assert.equal(await at("2026-12-02T16:59:59Z"),0)
  assert.equal(await at("2026-12-02T17:00:00Z",other),0)
  assert.deepEqual((await Promise.all([at("2026-12-02T17:00:00Z"),at("2026-12-02T17:00:00Z")])).sort(),[0,1])
  let attempts=0
  while(await deliverNext(worker,async()=>{attempts++;throw Object.assign(Error("relay busy"),{responseCode:451})},tenant)){}
  assert.equal(attempts,1)
  assert.equal(await at("2026-12-03T12:00:00Z"),0)
  const event=await withTenant(app,tenant,async db=>{
    const r=await db.query("SELECT n.recipient_id,o.event_type,o.payload,n.event_id FROM rms.notice n JOIN rms.outbox o ON (n.tenant_id,n.event_id)=(o.tenant_id,o.id)")
    assert.equal(r.rowCount,1)
    const n=r.rows[0]
    assert.equal(n.recipient_id,owner);assert.equal(n.event_type,"PROGRESS_REPORT_DUE_SOON");assert.equal(n.payload.periodId,period)
    return n.event_id
  })
  await withTenant(worker,tenant,db=>db.query("UPDATE rms.delivery SET available_at=now() WHERE channel='smtp' AND event_id=$1",[event]))
  assert.equal(await deliverNext(worker,async mail=>assert.equal(mail.eventId,event),tenant),true)
  const channels=await withTenant(app,tenant,db=>db.query("SELECT channel,status,attempts FROM rms.delivery WHERE event_id=$1 ORDER BY channel",[event]))
  assert.deepEqual(channels.rows,[{channel:"in_app",status:"sent",attempts:1},{channel:"smtp",status:"sent",attempts:2}])
  assert.equal(await at("2026-12-10T17:00:00Z"),1)
  assert.equal(await at("2026-12-12T17:00:00Z"),0)
  await assert.rejects(withTenant(app,tenant,db=>db.query("SELECT rms.enqueue_progress_reminders(now(),7)")),{code:"42501"})
})
